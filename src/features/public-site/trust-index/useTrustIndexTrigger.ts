import {
  isTrustIndexDismissed,
  isTrustIndexTabActive,
  markTrustIndexDismissed,
  trustReadingThresholdSeconds,
} from "@/lib/trust-index-labels";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseTrustIndexTriggerOptions {
  articleId: number | string;
  wordCount: number;
  bodyRef: React.RefObject<HTMLElement | null>;
  enabled?: boolean;
}

export function useTrustIndexTrigger({
  articleId,
  wordCount,
  bodyRef,
  enabled = true,
}: UseTrustIndexTriggerOptions) {
  const [open, setOpen] = useState(false);
  const activeMsRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  const reachedTimeRef = useRef(false);
  const reachedScrollRef = useRef(false);
  const triggeredRef = useRef(false);

  const thresholdSeconds = trustReadingThresholdSeconds(wordCount);

  const dismiss = useCallback(() => {
    markTrustIndexDismissed(articleId);
    setOpen(false);
  }, [articleId]);

  const tryOpen = useCallback(() => {
    if (triggeredRef.current) return;
    if (isTrustIndexDismissed(articleId)) return;
    if (!reachedTimeRef.current || !reachedScrollRef.current) return;
    triggeredRef.current = true;
    setOpen(true);
  }, [articleId]);

  useEffect(() => {
    activeMsRef.current = 0;
    lastTickRef.current = null;
    reachedTimeRef.current = false;
    reachedScrollRef.current = false;
    triggeredRef.current = false;
    setOpen(false);
  }, [articleId]);

  useEffect(() => {
    if (!enabled || wordCount <= 0) return;

    const tick = () => {
      if (isTrustIndexTabActive()) {
        const now = performance.now();
        if (lastTickRef.current != null) {
          activeMsRef.current += now - lastTickRef.current;
        }
        lastTickRef.current = now;

        if (activeMsRef.current >= thresholdSeconds * 1000) {
          reachedTimeRef.current = true;
          tryOpen();
        }
      } else {
        lastTickRef.current = null;
      }
    };

    const checkScrollEnd = () => {
      const body = bodyRef.current;
      if (!body) return;
      const rect = body.getBoundingClientRect();
      const bottom = rect.bottom + window.scrollY;
      if (window.scrollY + window.innerHeight >= bottom - 8) {
        reachedScrollRef.current = true;
        tryOpen();
      }
    };

    const interval = window.setInterval(tick, 500);
    window.addEventListener("scroll", checkScrollEnd, { passive: true });
    window.addEventListener("resize", checkScrollEnd);
    window.addEventListener("visibilitychange", tick);
    window.addEventListener("focus", tick);
    window.addEventListener("blur", tick);
    checkScrollEnd();

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("scroll", checkScrollEnd);
      window.removeEventListener("resize", checkScrollEnd);
      window.removeEventListener("visibilitychange", tick);
      window.removeEventListener("focus", tick);
      window.removeEventListener("blur", tick);
    };
  }, [articleId, bodyRef, enabled, thresholdSeconds, tryOpen, wordCount]);

  return { open, dismiss };
}
