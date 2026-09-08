import {createRecoveryMailer} from './services/recovery-mail.mjs';
import {createRateLimiter} from './middleware/rate-limit.mjs';
import http from "node:http";
import {createHash} from 'node:crypto';
import { mkdirSync, createReadStream, statSync } from "node:fs";
import { resolve, extname, sep } from "node:path";
import {createRecordModel} from './models/records.mjs';
import {createValidator} from './models/validation.mjs';
import {dispatchApi} from './routes/api.mjs';
import {httpError} from './utils/http.mjs';
const hash = (value) => createHash("sha256").update(value).digest("hex");
export function createApplication(
  db,
  {
    origins = ["http://localhost:5173", "http://localhost:3111"],
    uploads = "backend/data/uploads",
    production = false,
    base = "/live_commerce/",
    dist = "dist",
    recoveryMailer = createRecoveryMailer(),
  } = {},
) {
  mkdirSync(uploads, { recursive: true });
  const {list,get,audit,insert} = createRecordModel(db);
  const limited = createRateLimiter();
  const validate = createValidator(get);
  return http.createServer(async (req, res) => {
    const send = (status, data) => {
      res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      res.end(JSON.stringify(data));
    };
    try {
      const url = new URL(req.url, "http://localhost");
      const path = url.pathname;
      const origin = req.headers.origin;
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Referrer-Policy", "same-origin");
      if (origin && origins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Vary", "Origin");
      }
      if (req.method === "OPTIONS") {
        if (!origins.includes(origin))
          throw httpError(403, "Origin not allowed");
        res.writeHead(204, {
          "Access-Control-Allow-Headers":
            "Content-Type, X-CSRF-Token, X-Filename",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        });
        return res.end();
      }
      const mutation = !["GET", "HEAD"].includes(req.method);
      if (
        path.startsWith("/api/") &&
        mutation &&
        (!origin || !origins.includes(origin))
      )
        throw httpError(403, "Origin not allowed");
      const body = async (limit = 1_000_000) => {
        let size = 0;
        const chunks = [];
        for await (const chunk of req) {
          size += chunk.length;
          if (size > limit) throw httpError(413, "File or request too large");
          chunks.push(chunk);
        }
        return Buffer.concat(chunks);
      };
      const json = async () => {
        try {
          return JSON.parse((await body()).toString());
        } catch (error) {
          if (error.status) throw error;
          throw httpError(400, "Invalid JSON");
        }
      };
      const sessionToken = (req.headers.cookie || "")
        .split(";")
        .map((p) => p.trim())
        .find((p) => p.startsWith("orange_session="))
        ?.slice(15);
      const session = sessionToken
        ? db
            .prepare(
              "SELECT sessions.*,admins.username FROM sessions JOIN admins ON admins.id=sessions.admin_id WHERE token=? AND expires>?",
            )
            .get(hash(sessionToken), Date.now())
        : null;
      const requireAdmin = () => {
        if (!session) throw httpError(401, "로그인이 필요합니다.");
        if (mutation && req.headers["x-csrf-token"] !== session.csrf)
          throw httpError(403, "Invalid session token");
      };
      if (path === "/api/health") return send(200, { ok: true });
      if(await dispatchApi({req,res,path,send,json,body,db,list,get,insert,audit,validate,limited,session,requireAdmin,production,uploads,recoveryMailer})) return;
      if (path.startsWith("/api/")) throw httpError(404, "Not found");
      const isUpload = path.startsWith("/uploads/");
      const root = resolve(isUpload ? uploads : dist);
      const relative = isUpload
        ? path.slice(9)
        : path.startsWith(base)
          ? path.slice(base.length)
          : path.slice(1);
      const file = resolve(root, decodeURIComponent(relative || "index.html"));
      if (!file.startsWith(root + sep)) throw httpError(404, "Not found");
      let stat;
      try {
        stat = statSync(file);
      } catch {
        throw httpError(404, "Not found");
      }
      if (!stat.isFile()) throw httpError(404, "Not found");
      const mime =
        {
          ".html": "text/html; charset=utf-8",
          ".js": "text/javascript",
          ".css": "text/css",
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".webp": "image/webp",
          ".mp4": "video/mp4",
          ".svg": "image/svg+xml",
          ".json": "application/json",
        }[extname(file)] || "application/octet-stream";
      res.writeHead(200, {
        "Content-Type": mime,
        "Content-Length": stat.size,
        "Cache-Control": isUpload ? "public,max-age=86400" : "no-cache",
      });
      createReadStream(file).pipe(res);
    } catch (error) {
      if (!res.headersSent)
        send(error.status || 500, {
          error: error.status ? error.message : "서버 오류가 발생했습니다.",
        });
      else res.end();
      if (!error.status) console.error(error);
    }
  });
}
