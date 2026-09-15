import type { QueryClient } from "@tanstack/react-query";

const PUBLIC_QUERY_ROOTS = new Set([
  "public-categories",
  "public-article",
  "public-category",
  "articles",
  "related-articles",
  "public",
  "home-articles",
]);

export function invalidatePublicQueries(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({
    predicate: (query) => {
      const root = query.queryKey[0];
      return typeof root === "string" && PUBLIC_QUERY_ROOTS.has(root);
    },
  });
}
