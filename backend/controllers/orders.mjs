import {customerSession} from './customer.mjs';
import {randomUUID} from 'node:crypto';
import {httpError} from '../utils/http.mjs';
export async function ordersController({req,path,send,json,db,list,get,insert,limited}) {
      if (path === "/api/orders" && req.method === "POST") {
        limited(`order:${req.socket.remoteAddress}`, 6);
        const account=customerSession(req,db);
        if(account&&req.headers['x-csrf-token']!==account.csrf)throw httpError(403,'Invalid session token');
        const data = await json();
        if(typeof data.requestId !== 'string' || !/^[a-zA-Z0-9-]{16,100}$/.test(data.requestId)) throw httpError(400,'Invalid request ID');
        const previous=list('orders').find(o=>o.requestId===data.requestId);
        if(previous && previous.userId !== (account?.user_id ?? null))throw httpError(409,'Request ID already used');
        if(previous)return send(200,{id:previous.id,total:previous.total,paymentStatus:previous.paymentStatus});

        if (
          !data.customer ||
          !["name", "phone", "address"].every(
            (k) =>
              typeof data.customer[k] === "string" &&
              data.customer[k].trim().length >= 2 &&
              data.customer[k].length < 300,
          ) ||
          !Array.isArray(data.items) ||
          !data.items.length ||
          data.items.length > 50
        )
          throw httpError(400, "주문자 정보와 상품을 확인해주세요.");
        const quantities = new Map();
        for (const line of data.items) {
          if (
            !Number.isSafeInteger(line.quantity) ||
            line.quantity < 1 ||
            line.quantity > 99
          )
            throw httpError(400, "Invalid quantity");
          quantities.set(
            String(line.productId),
            (quantities.get(String(line.productId)) || 0) + line.quantity,
          );
        }
        db.exec("BEGIN IMMEDIATE");
        try {
          const lines = [];
          for (const [id, quantity] of quantities) {
            const p = get("products", id);
            if (
              !p ||
              p.status !== "published" ||
              p.stock < quantity ||
              quantity > 99
            )
              throw httpError(409, "상품 재고를 확인해주세요.");
            lines.push({
              productId: id,
              name: p.name,
              price: p.price,
              quantity,
            });
            const { _version, ...next } = p;
            next.stock -= quantity; if(next.target)next.participants=(next.participants||0)+1;
            db.prepare(
              "UPDATE records SET data=?,version=version+1 WHERE resource=? AND id=?",
            ).run(JSON.stringify(next), "products", id);
          }
          const order = {
            requestId: data.requestId,
            userId: account?.user_id ?? null,
            id: randomUUID(),
            customer: {
              name: data.customer.name,
              phone: data.customer.phone,
              address: data.customer.address,
            },
            items: lines,
            total: lines.reduce((sum, p) => sum + p.price * p.quantity, 0),
            status: "new",
            paymentStatus: "unpaid",
            createdAt: new Date().toISOString(),
          };
          insert("orders", order);
          db.exec("COMMIT");
          return send(201, {
            id: order.id,
            total: order.total,
            paymentStatus: "unpaid",
          });
        } catch (error) {
          db.exec("ROLLBACK");
          throw error;
        }
      }

}
