import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";
import { openDatabase, createAdmin } from "../models/database.mjs";
import { createApplication } from "../app.mjs";

test("authenticated management, publication, persistence and storefront submissions", async () => {
  const folder = mkdtempSync(resolve(".tmp/admin-api-"));
  const db = openDatabase(resolve(folder, "test.sqlite"));
  const password = randomBytes(20).toString("hex");
  createAdmin(db, "test-admin", password);
  const server = createApplication(db, {
    uploads: resolve(folder, "uploads"),
    origins: ["http://localhost:5173"],
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let cookie = "",
    csrf = "";
  const request = async (
    path,
    method = "GET",
    body,
    auth = true,
    extra = {},
  ) => {
    const response = await fetch(base + "/api" + path, {
      method,
      headers: {
        Origin: "http://localhost:5173",
        "Content-Type": "application/json",
        ...(auth ? { Cookie: cookie, "X-CSRF-Token": csrf } : {}),
        ...extra,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: response.status, data: await response.json(), response };
  };
  try {
    assert.equal((await request("/admin/products")).status, 401);
    assert.equal(
      (
        await request(
          "/auth/login",
          "POST",
          { username: "test-admin", password: "wrong" },
          false,
        )
      ).status,
      401,
    );
    const login = await request(
      "/auth/login",
      "POST",
      { username: "test-admin", password },
      false,
    );
    assert.equal(login.status, 200);
    cookie = login.response.headers.get("set-cookie").split(";")[0];
    csrf = login.data.csrf;
    assert.match(login.response.headers.get("set-cookie"), /HttpOnly/);
    const products = (await request("/admin/products")).data;
    const product = {
      ...products[0],
      name: "Admin edited product",
      price: 12345,
    };
    assert.equal(
      (
        await request(`/admin/products/${product.id}`, "PUT", product, true, {
          "X-CSRF-Token": "wrong",
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await request(`/admin/products/${product.id}`, "PUT", product, true, {
          Origin: "https://evil.example",
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await request(`/admin/products/${product.id}`, "PUT", {
          ...product,
          image: "javascript:alert(1)",
        })
      ).status,
      400,
    );
    assert.equal(
      (await request(`/admin/products/${product.id}`, "PUT", product)).status,
      200,
    );
    assert.equal(
      (await request(`/admin/products/${product.id}`, "PUT", product)).status,
      409,
    );
    let content = (await request("/content", "GET", undefined, false)).data;
    assert.equal(
      content.products.find((p) => p.id === product.id).price,
      12345,
    );
    const draft = await request("/admin/products", "POST", {
      name: "Draft",
      category: "식품",
      price: 5,
      stock: 2,
      status: "draft",
    });
    assert.equal(draft.status, 200);
    assert.ok(
      !(await request("/content")).data.products.some(
        (p) => p.id === draft.data.id,
      ),
    );
    const review = await request(
      "/reviews",
      "POST",
      {
        productId: product.id,
        title: "Review",
        body: "Pending review",
        rating: 4,
      },
      false,
    );
    assert.equal(review.status, 201);
    assert.ok(
      !(await request("/content")).data.reviews.some(
        (r) => r.id === review.data.id,
      ),
    );
    const pending = (await request("/admin/reviews")).data.find(
      (r) => r.id === review.data.id,
    );
    assert.equal(
      (
        await request(`/admin/reviews/${pending.id}`, "PUT", {
          ...pending,
          status: "approved",
        })
      ).status,
      200,
    );
    assert.ok(
      (await request("/content")).data.reviews.some((r) => r.id === pending.id),
    );
    const order = await request(
      "/orders",
      "POST",
      {
        requestId: randomBytes(16).toString("hex"), customer: {
          name: "Test Customer",
          phone: "01012345678",
          address: "Test address",
        },
        items: [{ productId: product.id, quantity: 2, price: 1 }],
        total: 1,
      },
      false,
    );
    assert.equal(order.status, 201);
    assert.equal(order.data.total, 24690);
    assert.equal(
      (await request("/admin/orders", "GET", undefined, false)).status,
      401,
    );
    assert.equal(
      (await request("/admin/products")).data.find((p) => p.id === product.id)
        .stock,
      98,
    );
    assert.equal(
      (
        await request(
          "/orders",
          "POST",
          {
            requestId: randomBytes(16).toString("hex"), customer: { name: "Test", phone: "12345", address: "Test address" },
            items: [{ productId: product.id, quantity: 99 }],
          },
          false,
        )
      ).status,
      409,
    );
    const storedOrder=(await request('/admin/orders')).data.find(o=>o.id===order.data.id);
    const duplicate=await request('/orders','POST',{requestId:storedOrder.requestId},false);
    assert.equal(duplicate.status,200);
    assert.equal(duplicate.data.id,storedOrder.id);
    const cancelled=await request(`/admin/orders/${storedOrder.id}`,'PUT',{...storedOrder,status:'cancelled'});
    assert.equal(cancelled.status,200);
    assert.equal((await request('/admin/products')).data.find(p=>p.id===product.id).stock,100);
    assert.equal((await request(`/admin/orders/${storedOrder.id}`,'PUT',{...cancelled.data,status:'cancelled'})).status,200);
    assert.equal((await request('/admin/products')).data.find(p=>p.id===product.id).stock,100);
    const contact=await request('/contact','POST',{email:'test@example.com',body:'Private customer question'},false);
    assert.equal(contact.status,201);
    const inquiry=(await request('/admin/questions')).data.find(q=>q.id===contact.data.id);
    await request(`/admin/questions/${inquiry.id}`,'PUT',{...inquiry,status:'approved',answer:'Received'});
    assert.ok(!(await request('/content')).data.questions.some(q=>q.id===inquiry.id));
    assert.ok((await request("/admin/audit")).data.length >= 3);
    await request("/auth/logout", "POST", {});
    assert.equal((await request("/admin/products")).status, 401);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    db.close();
  }
  const reopened = openDatabase(resolve(folder, "test.sqlite"));
  assert.equal(
    JSON.parse(
      reopened
        .prepare("SELECT data FROM records WHERE resource=? AND id=?")
        .get("products", "1").data,
    ).name,
    "Admin edited product",
  );
  reopened.close();
});
