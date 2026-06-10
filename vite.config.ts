import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths(), svgr()],
  server: {
    port: 1573,
    strictPort: true,
    proxy: {
      "/api": {
        target: "https://misdaq-production.up.railway.app",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
