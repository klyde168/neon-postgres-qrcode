import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import path from "path";
//import mkcert from 'vite-plugin-mkcert'; // <--- 匯入

export default defineConfig({
  plugins: [
    //mkcert(), // <--- 加入 mkcert 外掛
    remix({
      ignoredRouteFiles: ["**/.*"],
    })
  ],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },
  server: {
    port: 80,
    host: true, // 允許外部訪問
    open: true, // 自動開啟瀏覽器
    //https: true, // <--- 啟用基本的 HTTPS
  },
});