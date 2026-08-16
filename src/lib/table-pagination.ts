import type { PublicPagination } from "@/types";

export const TABLE_PAGE_SIZE = 10;

export function paginationItems(
  current: number,
  last: number,
): Array<number | "…"> {
  if (last <= 7) {
    return Array.from({ length: last }, (_, i) => i + 1);
  }

  const items: Array<number | "…"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(last - 1, current + 1);

  if (start > 2) items.push("…");
  for (let n = start; n <= end; n += 1) items.push(n);
  if (end < last - 1) items.push("…");
  items.push(last);
  return items;
}

export function paginateList<T>(
  items: T[],
  page: number,
  server?: PublicPagination,
  pageSize = TABLE_PAGE_SIZE,
) {
  const serverHasPages =
    !!server && (server.last_page > 1 || server.total > items.length);

  if (serverHasPages && server) {
    return {
      items,
      total: server.total,
      currentPage: server.current_page,
      lastPage: server.last_page,
      pageSize: server.per_page || pageSize,
    };
  }

  const total = items.length;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), lastPage);

  return {
    items: items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    total,
    currentPage,
    lastPage,
    pageSize,
  };
}
