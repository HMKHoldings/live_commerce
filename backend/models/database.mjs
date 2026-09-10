import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { randomBytes, scryptSync } from "node:crypto";

export const resources = [
  "products",
  "banners",
  "collections",
  "categories",
  "promos",
  "notices",
  "policies",
  "reviews",
  "questions",
  "orders",
  "settings",
];
export function openDatabase(
  path = process.env.DB_PATH || "backend/data/store.sqlite",
) {
  if (path !== ":memory:")
    mkdirSync(dirname(resolve(path)), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS records(resource TEXT NOT NULL,id TEXT NOT NULL,data TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1,PRIMARY KEY(resource,id));
    CREATE TABLE IF NOT EXISTS customers(id INTEGER PRIMARY KEY,username TEXT UNIQUE COLLATE NOCASE NOT NULL,name TEXT NOT NULL,email TEXT NOT NULL,phone TEXT NOT NULL DEFAULT '',salt TEXT NOT NULL,hash TEXT NOT NULL,data TEXT NOT NULL DEFAULT '{}');
    CREATE TABLE IF NOT EXISTS customer_sessions(token TEXT PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES customers(id),csrf TEXT NOT NULL,expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS customer_recovery(id TEXT PRIMARY KEY,purpose TEXT NOT NULL,user_ids TEXT NOT NULL,code_hash TEXT NOT NULL,expires INTEGER NOT NULL,attempts INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS admins(id INTEGER PRIMARY KEY,username TEXT UNIQUE NOT NULL,salt TEXT NOT NULL,hash TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,admin_id INTEGER NOT NULL REFERENCES admins(id),csrf TEXT NOT NULL,expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY,actor TEXT NOT NULL,action TEXT NOT NULL,resource TEXT NOT NULL,record_id TEXT NOT NULL,created TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS metadata(key TEXT PRIMARY KEY,value TEXT NOT NULL);`);
  if (!db.prepare("SELECT 1 FROM metadata WHERE key=?").get("seeded")) {
    const seed = JSON.parse(
      readFileSync(new URL("../seed.json", import.meta.url), "utf8"),
    );
    db.exec("BEGIN");
    try {
      const insert = db.prepare(
        "INSERT OR IGNORE INTO records(resource,id,data) VALUES(?,?,?)",
      );
      for (const [resource, items] of Object.entries(seed))
        for (const item of items)
          insert.run(resource, String(item.id), JSON.stringify(item));
      db.prepare("INSERT INTO metadata VALUES(?,?)").run(
        "seeded",
        new Date().toISOString(),
      );
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }
  return db;
}
export function createAdmin(db, username, password) {
  if (
    !/^[a-zA-Z0-9@._-]{3,100}$/.test(username) ||
    password.length < 6 ||
    password.length > 128
  )
    throw new Error(
      "Username: 3–100 characters. Password: 6–128 characters.",
    );
  const existing = db
    .prepare("SELECT id FROM admins WHERE username=?")
    .get(username);
  const salt = randomBytes(24).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  db.exec("BEGIN");
  try {
    db.prepare(
      "INSERT INTO admins(username,salt,hash) VALUES(?,?,?) ON CONFLICT(username) DO UPDATE SET salt=excluded.salt,hash=excluded.hash",
    ).run(username, salt, hash);
    const admin = db
      .prepare("SELECT id FROM admins WHERE username=?")
      .get(username);
    db.prepare("DELETE FROM sessions WHERE admin_id=?").run(admin.id);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return Boolean(existing);
}
