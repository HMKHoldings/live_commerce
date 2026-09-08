import { defineConfig } from "vite";
import { resolve } from "node:path";
export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/live_commerce/" : "/",
  server: { proxy: { '/api': 'http://127.0.0.1:3111', '/uploads': 'http://127.0.0.1:3111' } },
  build: { rollupOptions: { input: { store: resolve('index.html'), mypage: resolve('mypage.html'), admin: resolve('admin.html'), signup: resolve('signup.html'), login: resolve('login.html'), customerCenter: resolve('customer-center.html') } } },
}));