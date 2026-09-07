import {randomUUID} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {resources} from '../models/database.mjs';
import {httpError} from '../utils/http.mjs';
export async function adminController({req,path,send,json,body,db,list,get,insert,audit,validate,session,requireAdmin,uploads}) {
      if (path.startsWith("/api/admin/")) {
        requireAdmin();
        if (path === "/api/admin/audit" && req.method === "GET")
          return send(
            200,
            db.prepare("SELECT * FROM audit ORDER BY id DESC LIMIT 200").all(),
          );
        if (path === "/api/admin/upload" && req.method === "POST") {
          const type = req.headers["content-type"];
          const types = {
            "image/png": ".png",
            "image/jpeg": ".jpg",
            "image/webp": ".webp",
            "video/mp4": ".mp4",
          };
          if (!types[type])
            throw httpError(
              400,
              "PNG, JPG, WebP, MP4 파일만 업로드할 수 있습니다.",
            );
          const bytes = await body(50 * 1024 * 1024);
          const valid =
            type === "image/png"
              ? bytes
                  .subarray(0, 8)
                  .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
              : type === "image/jpeg"
                ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
                : type === "image/webp"
                  ? bytes.toString("ascii", 0, 4) === "RIFF" &&
                    bytes.toString("ascii", 8, 12) === "WEBP"
                  : bytes.toString("ascii", 4, 8) === "ftyp";
          if (!valid) throw httpError(400, "Invalid file content");
          const name = randomUUID() + types[type];
          writeFileSync(resolve(uploads, name), bytes);
          audit(session.username, "upload", "media", name);
          return send(201, { url: `/uploads/${name}` });
        }
        const [, , , resource, id] = path.split("/");
        if (!resources.includes(resource)) throw httpError(404, "Not found");
        if (req.method === "GET")
          return send(200, id ? get(resource, id) || null : list(resource));
        if (req.method === "POST" || req.method === "PUT") {
          let data = await json();
          if (resource === "orders") {
            if (req.method === "POST")
              throw httpError(405, "Orders are created from checkout");
            const current = get(resource, id);
            if (!current) throw httpError(404, "Not found");
            data = {
              ...current,
              status: data.status,
              tracking: String(data.tracking || "").slice(0, 200),
              _version: data._version,
            };
          }
          data.id = id || data.id || randomUUID();
          validate(resource, data);
          const version = data._version;
          delete data._version;
          if (id) {
            db.exec('BEGIN IMMEDIATE');
            try {
              const current=get(resource,id);
              if(resource==='orders') {
                if(!['new','processing','shipped','completed','cancelled'].includes(data.status))throw httpError(400,'Invalid order status');
                if(current.status==='cancelled' && data.status!=='cancelled')throw httpError(409,'취소된 주문은 다시 열 수 없습니다.');
              }
              const updated=db.prepare('UPDATE records SET data=?,version=version+1 WHERE resource=? AND id=? AND version=?').run(JSON.stringify(data),resource,id,version||0);
              if(!updated.changes)throw httpError(409,'새로고침 후 다시 저장해주세요.');
              if(resource==='orders' && data.status==='cancelled' && current.status!=='cancelled') {
                for(const line of current.items){const product=get('products',line.productId);if(!product)continue;const {_version,...restored}=product;restored.stock+=line.quantity;if(restored.target)restored.participants=Math.max(0,restored.participants-1);db.prepare('UPDATE records SET data=?,version=version+1 WHERE resource=? AND id=?').run(JSON.stringify(restored),'products',line.productId);}
              }
              db.exec('COMMIT');
            }catch(error){db.exec('ROLLBACK');throw error;}
          } else {
            if (get(resource, data.id))
              throw httpError(409, "ID already exists");
            insert(resource, data);
          }
          audit(session.username, id ? "update" : "create", resource, data.id);
          return send(200, get(resource, data.id));
        }
        if (req.method === "DELETE") {
          if (["orders", "settings"].includes(resource))
            throw httpError(405, "This record cannot be deleted");
          const { version } = await json();
          const removed = db
            .prepare(
              "DELETE FROM records WHERE resource=? AND id=? AND version=?",
            )
            .run(resource, id, version || 0);
          if (!removed.changes)
            throw httpError(409, "새로고침 후 다시 시도해주세요.");
          audit(session.username, "delete", resource, id);
          return send(200, { ok: true });
        }
        throw httpError(405, "Method not allowed");
      }

}
