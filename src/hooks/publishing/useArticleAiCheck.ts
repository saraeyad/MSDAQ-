import {
  AI_CHECK_POLL_MS,
  isAiCheckInProgress,
  pickLatestAiCheck,
} from "@/lib/publishing";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import type {
  AiCheck,
  CredibilityCheckResult,
  StandardsCheckResult,
} from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

interface UseArticleAiCheckBase {
  check: AiCheck | null;
  loadingInitial: boolean;
  starting: boolean;
  isPolling: boolean;
  startCheck: () => Promise<void>;
  refreshLatest: () => Promise<AiCheck | null>;
}

function aiCheckQueryKey(
  articleId: number | string,
  type: "credibility" | "standards",
) {
  return ["article-ai-check", String(articleId), type] as const;
}

export function useArticleAiCheck(
  articleId: number | string | undefined,
  type: "credibility",
): UseArticleAiCheckBase & { result: CredibilityCheckResult | null };

export function useArticleAiCheck(
  articleId: number | string | undefined,
  type: "standards",
): UseArticleAiCheckBase & { result: StandardsCheckResult | null };

export function useArticleAiCheck(
  articleId: number | string | undefined,
  type: "credibility" | "standards",
): UseArticleAiCheckBase & {
  result: CredibilityCheckResult | StandardsCheckResult | null;
} {
  const queryClient = useQueryClient();
  const [starting, setStarting] = useState(false);
  const queryKey =
    articleId == null ? null : aiCheckQueryKey(articleId, type);

  const loadLatest = useCallback(async () => {
    if (articleId == null || queryKey == null) return null;
    const cached = queryClient.getQueryData<AiCheck | null>(queryKey);

    if (cached && isAiCheckInProgress(cached)) {
      try {
        return await ArticlesStaff_APIs.getAiCheck(articleId, cached.id);
      } catch {
        /* fall through to the history list */
      }
    }

    const items = await ArticlesStaff_APIs.listAiChecks(articleId, type);
    return pickLatestAiCheck(items, type) ?? cached ?? null;
  }, [articleId, queryClient, queryKey]);

  const query = useQuery({
    queryKey: queryKey ?? ["article-ai-check", "none", type],
    enabled: articleId != null,
    queryFn: loadLatest,
    staleTime: 0,
    refetchOnMount: "always",
    refetchInterval: (current) =>
      current.state.data && isAiCheckInProgress(current.state.data)
        ? AI_CHECK_POLL_MS
        : false,
  });

  const check = query.data ?? null;

  const refreshLatest = useCallback(async () => {
    if (queryKey == null) return null;
    await queryClient.invalidateQueries({ queryKey });
    return queryClient.getQueryData<AiCheck | null>(queryKey) ?? null;
  }, [queryClient, queryKey]);

  const startCheck = useCallback(async () => {
    if (articleId == null || queryKey == null) return;
    setStarting(true);
    try {
      const row =
        type === "credibility"
          ? await ArticlesStaff_APIs.enqueueCredibilityCheck(articleId)
          : await ArticlesStaff_APIs.runStandardsCheck(articleId);
      queryClient.setQueryData(queryKey, row);
      if (type === "standards" && row.status === "done") {
        await queryClient.invalidateQueries({
          queryKey: ["staff-article", String(articleId)],
        });
      }
    } finally {
      setStarting(false);
    }
  }, [articleId, queryClient, queryKey, type]);

  let result: CredibilityCheckResult | StandardsCheckResult | null = null;
  if (
    check &&
    check.type === type &&
    check.status === "done" &&
    check.result
  ) {
    result = check.result;
  }

  return {
    check,
    result,
    loadingInitial: query.isPending,
    starting,
    isPolling: check ? isAiCheckInProgress(check) : false,
    startCheck,
    refreshLatest,
  };
}
