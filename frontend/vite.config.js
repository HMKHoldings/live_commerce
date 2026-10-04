import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => ({
  root: frontendRoot,
  base: mode === "production" ? "/live_commerce/" : "/",
  server: {
    proxy: {
      "/api": "http://[::1]:3111",
      "/uploads": "http://[::1]:3111",
    },
  },
  build: {
    outDir: resolve(frontendRoot, "../dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        store: resolve(frontendRoot, "index.html"),
        mypage: resolve(frontendRoot, "mypage.html"),
        admin: resolve(frontendRoot, "admin.html"),
        signup: resolve(frontendRoot, "signup.html"),
        login: resolve(frontendRoot, "login.html"),
        creatorLogin: resolve(frontendRoot, "creator-login.html"),
        creatorSignup: resolve(frontendRoot, "creator-signup.html"),
        creatorDashboard: resolve(frontendRoot, "creator-dashboard.html"),
        customerCenter: resolve(frontendRoot, "customer-center.html"),
        notices: resolve(frontendRoot, "notices.html"),
        about: resolve(frontendRoot, "about.html"),
        partnership: resolve(frontendRoot, "partnership.html"),
        seller: resolve(frontendRoot, "seller.html"),
        terms: resolve(frontendRoot, "terms.html"),
        privacy: resolve(frontendRoot, "privacy.html"),
      },
    },
  },
}));