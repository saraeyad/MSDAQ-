import { AuthProvider } from "@/context/auth";
import { SiteOriginProvider } from "@/context/site-origin";
import { AppRoutes } from "@/router/AppRoutes";
import {
  buildArticleJsonLd,
} from "@/lib/seo/article-seo";
import {
  buildCategoryJsonLd,
} from "@/lib/seo/category-seo";
import {
  renderJsonLdScript,
} from "@/lib/seo/render-head";
import {
  fetchPublicArticle,
  fetchPublicCategory,
  PublicApiNotFoundError,
} from "@/lib/server-public-api";
import type { PublicArticle, PublicCategoryDetail } from "@/types";
import {
  dehydrate,
  QueryClient,
  QueryClientProvider,
  type DehydratedState,
} from "@tanstack/react-query";
import { renderToString } from "react-dom/server";
import { HelmetProvider, type HelmetServerState } from "react-helmet-async";
import { StaticRouter } from "react-router-dom";

export { PublicApiNotFoundError };

export interface SsrPageResult {
  appHtml: string;
  head: string;
  dehydratedState: DehydratedState;
  status: number;
}

const ARTICLE_ROUTE = /^\/articles\/(\d+)\/?$/;
const CATEGORY_ROUTE = /^\/categories\/([^/]+)\/?$/;

function createSsrQueryClient(options: {
  article?: PublicArticle;
  categoryData?: PublicCategoryDetail;
  slug?: string;
  page?: number;
}): QueryClient {
  const client = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: false },
    },
  });

  if (options.article) {
    client.setQueryData(
      ["public-article", String(options.article.id)],
      options.article,
    );
  }

  if (options.categoryData && options.slug) {
    client.setQueryData(
      ["public-category", options.slug, options.page ?? 1],
      options.categoryData,
    );
  }

  return client;
}

function renderPageTree(
  url: string,
  queryClient: QueryClient,
  origin: string,
): { appHtml: string; head: string; dehydratedState: DehydratedState } {
  const helmetContext: { helmet?: HelmetServerState } = {};

  const appHtml = renderToString(
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <SiteOriginProvider origin={origin}>
          <AuthProvider>
            <StaticRouter location={url}>
              <AppRoutes />
            </StaticRouter>
          </AuthProvider>
        </SiteOriginProvider>
      </QueryClientProvider>
    </HelmetProvider>,
  );

  const helmet = helmetContext.helmet;
  const head = helmet
    ? [
        helmet.title.toString(),
        helmet.meta.toString(),
        helmet.link.toString(),
      ].join("\n")
    : "";

  return {
    appHtml,
    head,
    dehydratedState: dehydrate(queryClient),
  };
}

export async function handleSsrRequest(
  url: string,
  origin: string,
): Promise<SsrPageResult | null> {
  const pathname = url.split("?")[0] ?? url;
  const pageParam = new URL(url, "http://ssr.local").searchParams.get("page");
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  const articleMatch = pathname.match(ARTICLE_ROUTE);
  if (articleMatch) {
    const id = articleMatch[1]!;
    const article = await fetchPublicArticle(id);
    const jsonLd = buildArticleJsonLd(article, origin);
    const jsonLdScript = renderJsonLdScript(jsonLd);

    const queryClient = createSsrQueryClient({ article });
    const rendered = renderPageTree(pathname, queryClient, origin);

    return {
      ...rendered,
      head: [rendered.head, jsonLdScript].filter(Boolean).join("\n    "),
      status: 200,
    };
  }

  const categoryMatch = pathname.match(CATEGORY_ROUTE);
  if (categoryMatch) {
    const slug = decodeURIComponent(categoryMatch[1]!);
    const categoryData = await fetchPublicCategory(slug, page);
    const jsonLdScript = renderJsonLdScript(
      buildCategoryJsonLd(categoryData.category, origin),
    );
    const categoryUrl = page > 1 ? `${pathname}?page=${page}` : pathname;
    const queryClient = createSsrQueryClient({
      categoryData,
      slug,
      page,
    });
    const rendered = renderPageTree(categoryUrl, queryClient, origin);

    return {
      ...rendered,
      head: [rendered.head, jsonLdScript].filter(Boolean).join("\n    "),
      status: 200,
    };
  }

  return null;
}

export function notFoundPage(title: string): SsrPageResult {
  return {
    appHtml: `<div class="container-page py-16 text-center"><h1>${title}</h1></div>`,
    head: `<title>${title}</title>`,
    dehydratedState: dehydrate(new QueryClient()),
    status: 404,
  };
}
