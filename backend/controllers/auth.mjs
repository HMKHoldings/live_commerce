import {randomBytes,timingSafeEqual,scrypt,createHash} from 'node:crypto';
import {promisify} from 'node:util';
import {httpError} from '../utils/http.mjs';
const derive=promisify(scrypt);
const hash=value=>createHash('sha256').update(value).digest('hex');
export async function authController({req,res,path,send,json,db,limited,session,requireAdmin,production}) {
      if (path === "/api/auth/login" && req.method === "POST") {
        limited(`login:${req.socket.remoteAddress}`, 8);
        const { username, password } = await json();
        if (
          typeof username !== "string" ||
          typeof password !== "string" ||
          password.length > 200
        )
          throw httpError(400, "Invalid credentials");
        const admin = db
          .prepare("SELECT * FROM admins WHERE username=?")
          .get(username);
        const check = await derive(
          password,
          admin?.salt || "invalid-user-salt",
          64,
        );
        if (!admin || !timingSafeEqual(check, Buffer.from(admin.hash, "hex")))
          throw httpError(401, "아이디 또는 비밀번호를 확인해주세요.");
        const token = randomBytes(32).toString("hex"),
          csrf = randomBytes(24).toString("hex");
        db.prepare("DELETE FROM sessions WHERE expires<?").run(Date.now());
        db.prepare("INSERT INTO sessions VALUES(?,?,?,?)").run(
          hash(token),
          admin.id,
          csrf,
          Date.now() + 8 * 3600000,
        );
        res.setHeader(
          "Set-Cookie",
          `orange_session=${token}; HttpOnly; Path=/; SameSite=${production ? "None" : "Lax"}; Max-Age=28800${production ? "; Secure" : ""}`,
        );
        return send(200, { username: admin.username, csrf });
      }
      if (path === "/api/auth/me") {
        requireAdmin();
        return send(200, { username: session.username, csrf: session.csrf });
      }
      if (path === "/api/auth/logout" && req.method === "POST") {
        requireAdmin();
        db.prepare("DELETE FROM sessions WHERE token=?").run(session.token);
        res.setHeader(
          "Set-Cookie",
          "orange_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax",
        );
        return send(200, { ok: true });
      }

}
