import {randomUUID} from 'node:crypto';
import {resources} from '../models/database.mjs';
import {httpError} from '../utils/http.mjs';
export async function contentController({req,path,send,json,list,get,insert,validate,limited}) {
      if (path === "/api/content" && req.method === "GET") {
        const result = {};
        for (const resource of resources.filter(
          (r) => !["orders", "questions"].includes(r),
        ))
          result[resource] = list(resource)
            .filter(
              (p) =>
                !["hidden", "draft", "pending", "rejected"].includes(p.status),
            )
            .map(({ _version, ...item }) => item);
        result.questions = list("questions")
          .filter((q) => q.status === "approved" && q.productId)
          .map(({ id, productId, body, answer, date }) => ({
            id,
            productId,
            body,
            answer,
            date,
          }));
        return send(200, result);
      }
      if(path === '/api/contact' && req.method === 'POST') {
        limited('contact:'+req.socket.remoteAddress, 8);
        const data=await json();
        if(typeof data.email!=='string'||data.email.length>200||!/^\S+@\S+\.\S+$/.test(data.email)||typeof data.body!=='string'||!data.body.trim()||data.body.length>2000)throw httpError(400,'이메일과 문의 내용을 확인해주세요.');
        const item={id:randomUUID(),productId:'',title:'1:1 문의',body:data.body.trim(),email:data.email,status:'pending',date:new Date().toISOString().slice(0,10)};
        insert('questions',item);return send(201,{id:item.id});
      }
      if (
        ["/api/questions", "/api/reviews"].includes(path) &&
        req.method === "POST"
      ) {
        limited(`submission:${req.socket.remoteAddress}`, 10);
        const data = await json();
        const resource = path.slice(5);
        if (
          !get("products", data.productId) ||
          typeof data.body !== "string" ||
          !data.body.trim() ||
          data.body.length > 2000
        )
          throw httpError(400, "상품과 내용을 확인해주세요.");
        const item = {
          id: randomUUID(),
          productId: String(data.productId),
          body: data.body.trim(),
          title: String(data.title || "상품 문의").slice(0, 100),
          author: "방문자",
          status: "pending",
          date: new Date().toISOString().slice(0, 10),
          rating: Number(data.rating ?? 5),
        };
        validate(resource, item);
        insert(resource, item);
        return send(201, {
          id: item.id,
          message: "접수되었습니다. 관리자 확인 후 게시됩니다.",
        });
      }

}
