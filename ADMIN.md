# Orange Store admin

## Local setup

Node.js 22.18+ is required (SQLite is provided by Node). Existing homepage data is seeded once into SQLite.

1. `npm install`
2. `npm run admin:create -- owner` — enter and confirm a password of at least 12 characters. Input is hidden. There is no default password.
3. In one terminal: `npm run server`
4. In another terminal: `npm run dev`
5. Open `http://localhost:5173/admin.html` and sign in. Storefront: `http://localhost:5173/`.

If Vite selects another port, add its exact origin to `.env.server` (`ALLOWED_ORIGINS`) and restart the server.

## Managed content

- Products: create/edit/delete, publish/hide, stock, prices, detail text, images, video and poster URLs, SNS channel, group-buy deadline/target/count, popular/best placement.
- Main banners and promo banners: text, media, order, visibility and existing visual themes.
- Collections: images, descriptions, product IDs and order.
- Categories: column headings, subcategory labels and order.
- Notices and company/policy text.
- Site settings: logo, brand, contact/company details, social URLs, homepage section visibility.
- Orders: customer details, immutable product/price snapshots, unpaid order status and tracking; cancellations restore stock once.
- Reviews and inquiries: pending/approved/rejected moderation and admin replies.
- Activity history records admin writes without storing passwords or inquiry bodies in the audit log.

Storefront content refreshes on focus and every 30 seconds. Same-browser admin saves trigger an immediate refresh via a storage event. File uploads are PNG/JPG/WebP/MP4, maximum 50 MB. Uploading a file does not publish it until its content record is saved.

The admin controls content within the existing layouts, not arbitrary React/CSS source code. New visual templates are still code changes.

## Data and authentication

`backend/data/store.sqlite` and `backend/data/uploads/` contain persistent application data and are gitignored. Database seed: `backend/seed.json`; static offline fallback: `src/data/storefront.json`. Editing seed files does not overwrite an existing database.

Passwords use salted scrypt hashes. Sessions are server-side, expire after eight hours, and use HttpOnly cookies. Admin mutations require a session CSRF token and an allowed Origin. Conflicting edits return HTTP 409 instead of overwriting another editor. Admin accounts are provisioned through the server CLI only.

Orders are **unpaid order requests**, not card payments. Customer account registration/login, payment gateway transactions, shipping provider integration and live-stream provisioning are not implemented by the CMS. Video URLs are managed; an actual live stream must be supplied by its provider.

## Production hosting

GitHub Pages serves only the frontend. The Node server needs a persistent host, persistent storage and HTTPS. It cannot run inside GitHub Pages.

Preferred: deploy the built frontend and backend on the same HTTPS host. Run `npm ci`, `npm run build`, then `npm run server`; the server serves `/live_commerce/` and `/live_commerce/admin.html`. Configure a reverse proxy to Node (default 127.0.0.1:3111). Set `NODE_ENV=production`, exact `ALLOWED_ORIGINS`, and persistent `DB_PATH` / `UPLOAD_DIR` in `.env.server`. Never expose the database, backups or source directory as public static files.

If keeping GitHub Pages, set the repository Actions variable `VITE_API_URL` to the public HTTPS backend origin and redeploy. Allow `https://hmkholdings.github.io` in the server's `ALLOWED_ORIGINS`. For reliable admin cookies, open the admin page on the backend host rather than GitHub Pages. Third-party cookie restrictions can prevent cross-site admin login.

Until a backend URL is configured, GitHub Pages continues showing the static snapshot; it is not a connected admin deployment. This change does not provision a host or publish credentials.

## Backup and checks

- `npm run backup` creates a consistent SQLite backup under `backend/data/backups/`.
- Back up `backend/data/uploads/` separately; keep backups off the server too.
- Restore with the server stopped, using a chosen backup as the configured SQLite file and its matching upload directory.
- `npm run test:server` covers auth, CSRF/origin checks, version conflicts, publication, moderation, server-priced orders and persistence.
- `npm run build` builds storefront and admin entry points.

Architecture: `backend/models/` (SQLite storage and validation), `backend/controllers/` (request handling), `backend/routes/api.mjs` (API routing), `backend/app.mjs` (HTTP middleware and static files), `src/StoreContext.jsx` (public content), `src/admin/` (management UI).

The React storefront and admin UI form the View layer. Run backend commands from the repository root; persistent data is in `backend/data/`.
