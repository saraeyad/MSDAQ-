import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT) || 1573;
const resolvePath = (p: string) => path.resolve(__dirname, p);

function getRequestOrigin(req: express.Request): string {
  const configured = process.env.VITE_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");

  const host = req.get("host");
  const protocol = req.protocol;
  if (host) return `${protocol}://${host}`;
  return "https://misdaq.ps";
}

function injectTemplate(
  template: string,
  {
    appHtml,
    head,
    dehydratedState,
  }: {
    appHtml: string;
    head: string;
    dehydratedState: unknown;
  },
): string {
  const stateScript = dehydratedState
    ? `<script>window.__REACT_QUERY_STATE__=${JSON.stringify(dehydratedState).replace(/</g, "\\u003c")}</script>`
    : "";

  return template
    .replace("<!--ssr-head-->", head || "<title>مصداق — CDMC</title>")
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
    .replace("<!--ssr-state-->", stateScript);
}

async function createServer() {
  const app = express();

  let vite: Awaited<
    ReturnType<typeof import("vite").createServer>
  > | undefined;
  let template = "";
  type SsrModule = typeof import("../src/entry-server.js");
  let ssrModule: SsrModule | undefined;

  if (isProduction) {
    const clientDist = resolvePath("../dist/client");
    const serverEntry = resolvePath("../dist/server/entry-server.js");

    app.use(express.static(clientDist, { index: false }));
    template = fs.readFileSync(path.join(clientDist, "index.html"), "utf-8");
    ssrModule = await import(pathToFileURL(serverEntry).href);
  } else {
    const { createServer: createViteServer } = await import("vite");
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares as unknown as express.RequestHandler);
    template = fs.readFileSync(resolvePath("../index.html"), "utf-8");
  }

  async function loadSsrModule(): Promise<SsrModule> {
    if (isProduction && ssrModule) return ssrModule;
    return vite!.ssrLoadModule("/src/entry-server.tsx") as Promise<SsrModule>;
  }

  app.use("*all", async (req, res, next) => {
    try {
      const url = req.originalUrl;
      const origin = getRequestOrigin(req);
      const { handleSsrRequest, notFoundPage, PublicApiNotFoundError } =
        await loadSsrModule();

      let pageTemplate = template;
      if (!isProduction && vite) {
        pageTemplate = await vite.transformIndexHtml(url, template);
      }

      try {
        const result = await handleSsrRequest(url, origin);

        if (result) {
          res
            .status(result.status)
            .set({ "Content-Type": "text/html; charset=utf-8" })
            .end(
              injectTemplate(pageTemplate, {
                appHtml: result.appHtml,
                head: result.head,
                dehydratedState: result.dehydratedState,
              }),
            );
          return;
        }
      } catch (error) {
        if (error instanceof PublicApiNotFoundError) {
          const missing = url.includes("/articles/")
            ? notFoundPage("المقال غير موجود")
            : notFoundPage("القسم غير موجود");
          res
            .status(missing.status)
            .set({ "Content-Type": "text/html; charset=utf-8" })
            .end(
              injectTemplate(pageTemplate, {
                appHtml: missing.appHtml,
                head: missing.head,
                dehydratedState: missing.dehydratedState,
              }),
            );
          return;
        }
        throw error;
      }

      res
        .status(200)
        .set({ "Content-Type": "text/html; charset=utf-8" })
        .end(
          injectTemplate(pageTemplate, {
            appHtml: "",
            head: "",
            dehydratedState: null,
          }),
        );
    } catch (error) {
      if (!isProduction && vite && error instanceof Error) {
        vite.ssrFixStacktrace(error);
      }
      next(error);
    }
  });

  app.listen(port, () => {
    console.info(`Server running at http://localhost:${port}`);
  });
}

createServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
