import {
  isTrustIndexDismissed,
  isTrustIndexTabActive,
  markTrustIndexDismissed,
  trustReadingThresholdSeconds,
} from "@/lib/site";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseTrustIndexTriggerOptions {
  articleId: number | string;
  wordCount: number;
  bodyRef: React.RefObject<HTMLElement | null>;
  enabled?: boolean;
}

function isBodyScrolledToEnd(body: HTMLElement): boolean {
  const rect = body.getBoundingClientRect();
  return window.innerHeight >= rect.bottom - 8;
}

export function useTrustIndexTrigger({
  articleId,
  wordCount,
  bodyRef,
  enabled = true,
}: UseTrustIndexTriggerOptions) {
  const [open, setOpen] = useState(false);
  const triggeredRef = useRef(false);
  const readMsRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  const scrolledRef = useRef(false);

  const dismiss = useCallback(() => {
    markTrustIndexDismissed(articleId);
    setOpen(false);
  }, [articleId]);

  const tryOpen = useCallback(() => {
    if (triggeredRef.current) return;
    if (isTrustIndexDismissed(articleId)) return;
    triggeredRef.current = true;
    setOpen(true);
  }, [articleId]);

  useEffect(() => {
    triggeredRef.current = false;
    readMsRef.current = 0;
    lastTickRef.current = null;
    scrolledRef.current = false;
    setOpen(false);
  }, [articleId]);

  useEffect(() => {
    if (!enabled || wordCount <= 0) return;

    const thresholdMs = trustReadingThresholdSeconds(wordCount) * 1000;

    const checkScroll = () => {
      const body = bodyRef.current;
      if (!body) return;
      if (isBodyScrolledToEnd(body)) {
        scrolledRef.current = true;
      }
    };

    const evaluate = () => {
      checkScroll();
      if (
        scrolledRef.current &&
        readMsRef.current >= thresholdMs
      ) {
        tryOpen();
      }
    };

    const tick = () => {
      if (!isTrustIndexTabActive()) {
        lastTickRef.current = null;
        return;
      }
      const now = performance.now();
      if (lastTickRef.current != null) {
        readMsRef.current += now - lastTickRef.current;
      }
      lastTickRef.current = now;
      evaluate();
    };

    window.addEventListener("scroll", evaluate, { passive: true });
    window.addEventListener("resize", evaluate);
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", tick);
    const interval = window.setInterval(tick, 500);
    evaluate();

    return () => {
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("resize", evaluate);
      window.removeEventListener("focus", tick);
      document.removeEventListener("visibilitychange", tick);
      window.clearInterval(interval);
    };
  }, [articleId, bodyRef, enabled, tryOpen, wordCount]);

  return { open, dismiss };
}
