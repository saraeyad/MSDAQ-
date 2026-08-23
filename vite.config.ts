import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths(), svgr()],
  ssr: {
    noExternal: ["react-helmet-async"],
  },
  build: {
    outDir: "dist/client",
  },
  server: {
    port: 1573,
    strictPort: true,
    proxy: {
      "/api": {
        target: "https://api.sabbarapost.org",
        changeOrigin: true,
        secure: true,
      },
      "/storage": {
        target: "https://api.sabbarapost.org",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
