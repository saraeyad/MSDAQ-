import {
  AI_CHECK_POLL_MS,
  isAiCheckInProgress,
  pickLatestAiCheck,
} from "@/lib/publishing";
import { getApiErrorMessage } from "@/lib/api";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import type {
  AiCheck,
  CredibilityCheckResult,
  StandardsCheckResult,
} from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseArticleAiCheckBase {
  check: AiCheck | null;
  loadingInitial: boolean;
  loadingHistory: boolean;
  starting: boolean;
  isPolling: boolean;
  loadError: string | null;
  startCheck: () => Promise<void>;
  refreshLatest: () => Promise<AiCheck | null>;
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
  const [check, setCheck] = useState<AiCheck | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [starting, setStarting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const pollGenerationRef = useRef(0);

  const invalidateArticle = useCallback(async () => {
    if (articleId == null) return;
    await queryClient.invalidateQueries({
      queryKey: ["staff-article", String(articleId)],
    });
  }, [articleId, queryClient]);

  const refreshLatest = useCallback(async () => {
    if (articleId == null) return null;
    setLoadingHistory(true);
    setLoadError(null);
    try {
      // Hydrate from GET /articles/{id}/ai-checks?type=… so revisit shows the saved run.
      const items = await ArticlesStaff_APIs.listAiChecks(articleId, type);
      const latest = pickLatestAiCheck(items, type);
      setCheck(latest);
      return latest;
    } catch (err) {
      setLoadError(getApiErrorMessage(err));
      throw err;
    } finally {
      setLoadingHistory(false);
    }
  }, [articleId, type]);

  useEffect(() => {
    if (articleId == null) {
      setCheck(null);
      setLoadError(null);
      setLoadingInitial(false);
      return;
    }
    let cancelled = false;
    setLoadingInitial(true);
    setCheck(null);
    setLoadError(null);
    void refreshLatest()
      .catch(() => {
        if (!cancelled) setCheck(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingInitial(false);
      });
    return () => {
      cancelled = true;
    };
  }, [articleId, refreshLatest]);

  useEffect(() => {
    if (articleId == null || !check || !isAiCheckInProgress(check)) {
      return;
    }

    const generation = ++pollGenerationRef.current;
    const checkId = check.id;
    let cancelled = false;

    const pollOnce = async () => {
      try {
        const row = await ArticlesStaff_APIs.getAiCheck(articleId, checkId);
        if (cancelled || generation !== pollGenerationRef.current) return;
        setCheck(row);
        if (row.status === "done" || row.status === "failed") {
          await invalidateArticle();
        }
      } catch {
        /* transient network errors — next tick retries */
      }
    };

    void pollOnce();
    const intervalId = window.setInterval(() => void pollOnce(), AI_CHECK_POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [articleId, check?.id, check?.status, invalidateArticle]);

  const startCheck = useCallback(async () => {
    if (articleId == null) return;
    setStarting(true);
    setLoadError(null);
    try {
      const row =
        type === "credibility"
          ? await ArticlesStaff_APIs.enqueueCredibilityCheck(articleId)
          : await ArticlesStaff_APIs.runStandardsCheck(articleId);
      setCheck(row);
      if (type === "standards" && row.status === "done") {
        await invalidateArticle();
      }
    } finally {
      setStarting(false);
    }
  }, [articleId, invalidateArticle, type]);

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
    loadingInitial,
    loadingHistory,
    starting,
    isPolling: check ? isAiCheckInProgress(check) : false,
    loadError,
    startCheck,
    refreshLatest,
  };
}
