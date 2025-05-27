import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*"],
    })
  ],
  build: {
    rollupOptions: {
      external: [],
    },
  },
  ssr: {
    noExternal: ["@neondatabase/serverless"],
  },
  optimizeDeps: {
    include: ["@neondatabase/serverless"],
  },
});