import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*"],
    })
  ],
  ssr: {
    // 將 Neon 套件標記為外部依賴，避免 SSR 建置時的問題
    noExternal: ["@neondatabase/serverless"],
  },
});