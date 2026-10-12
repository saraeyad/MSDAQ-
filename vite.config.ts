import { apiUrlFromCookie, STAGING_API_URL } from "./src/lib/api/api-targets";
import react from "@vitejs/plugin-react";
import { defineConfig, type ProxyOptions } from "vite";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

function devApiProxy(): ProxyOptions {
  return {
    target: STAGING_API_URL,
    changeOrigin: true,
    secure: true,
    configure(proxy) {
      proxy.before("web", "stream", (req, _res, options) => {
        options.target = new URL(apiUrlFromCookie(req.headers.cookie));
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tsconfigPaths(), svgr()],
  optimizeDeps: {
    include: [
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-navigation-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slider",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
    ],
  },
  ssr: {
    noExternal: ["react-helmet-async"],
  },
  build: {
    outDir: "dist/client",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/recharts")) return "vendor-charts";
          if (id.includes("node_modules/@fullcalendar"))
            return "vendor-calendar";
          if (id.includes("node_modules/wavesurfer")) return "vendor-audio";
          return undefined;
        },
      },
    },
  },
  server: {
    port: 1573,
    strictPort: true,
    proxy: {
      "/api": devApiProxy(),
      "/storage": devApiProxy(),
      "/voice-samples": devApiProxy(),
    },
  },
});
