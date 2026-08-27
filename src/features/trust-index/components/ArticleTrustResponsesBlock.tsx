import { TrustIndexResponsesTable } from "@/features/trust-index/components/TrustIndexResponsesTable";
import { getApiErrorMessage } from "@/lib/api-data";
import { paginateList } from "@/lib/table-pagination";
import { TrustIndex_APIs } from "@/services/api/trust-index";
import { ARTICLE_TRUST_RESPONSES_PAGE_SIZE } from "@/types";
import type { TrustIndexListParams } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface ArticleTrustResponsesBlockProps {
  articleId: number | string;
  filterParams?: Pick<TrustIndexListParams, "start" | "end">;
  hasDateFilter?: boolean;
  enabled?: boolean;
  className?: string;
}

export function ArticleTrustResponsesBlock({
  articleId,
  filterParams = {},
  hasDateFilter = false,
  enabled = true,
  className,
}: ArticleTrustResponsesBlockProps) {
  const [page, setPage] = useState(1);

  const responsesQuery = useQuery({
    queryKey: [
      "trust-index-article-responses",
      articleId,
      filterParams.start,
      filterParams.end,
    ],
    queryFn: () => TrustIndex_APIs.articleResponses(articleId, filterParams),
    enabled,
  });

  const allResponses = responsesQuery.data?.items ?? [];

  const { items, total, currentPage, lastPage, pageSize } = paginateList(
    allResponses,
    page,
    undefined,
    ARTICLE_TRUST_RESPONSES_PAGE_SIZE,
  );

  useEffect(() => {
    if (page > 1 && items.length === 0 && allResponses.length > 0) {
      setPage(1);
    }
  }, [allResponses.length, items.length, page]);

  useEffect(() => {
    setPage(1);
  }, [articleId, filterParams.start, filterParams.end]);

  return (
    <div className={className}>
      {responsesQuery.isLoading ? (
        <p className="article-trust-feedback__empty">جاري التحميل...</p>
      ) : responsesQuery.isError ? (
        <p className="article-trust-feedback__error">
          {getApiErrorMessage(responsesQuery.error)}
        </p>
      ) : (
        <TrustIndexResponsesTable
          items={items}
          currentPage={currentPage}
          lastPage={lastPage}
          total={total}
          pageSize={pageSize}
          hasDateFilter={hasDateFilter}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
