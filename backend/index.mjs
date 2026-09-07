import { openDatabase } from "./models/database.mjs";
import { createApplication } from "./app.mjs";
const db = openDatabase();
const production = process.env.NODE_ENV === "production";
const origins = (
  process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:5174,http://localhost:3111"
)
  .split(",")
  .map((s) => s.trim());
if (production && !process.env.ALLOWED_ORIGINS)
  throw new Error(
    "Set ALLOWED_ORIGINS to your HTTPS storefront/admin origins.",
  );
const server = createApplication(db, {
  production,
  origins,
  uploads: process.env.UPLOAD_DIR || "backend/data/uploads",
});
server.listen(
  Number(process.env.PORT || 3111),
  process.env.HOST || "127.0.0.1",
  () =>
    console.log(
      `Orange Store backend: http://localhost:${process.env.PORT || 3111}`,
    ),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () =>
    server.close(() => {
      db.close();
      process.exit(0);
    }),
  );
