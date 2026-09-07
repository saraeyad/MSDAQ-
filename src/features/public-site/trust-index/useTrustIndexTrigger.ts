import {
  isTrustIndexDismissed,
  markTrustIndexDismissed,
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
  const triggeredRef = useRef(false);

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
    setOpen(false);
  }, [articleId]);

  useEffect(() => {
    if (!enabled || wordCount <= 0) return;

    const checkScrollEnd = () => {
      const body = bodyRef.current;
      if (!body) return;
      const rect = body.getBoundingClientRect();
      const bottom = rect.bottom + window.scrollY;
      if (window.scrollY + window.innerHeight >= bottom - 8) {
        tryOpen();
      }
    };

    window.addEventListener("scroll", checkScrollEnd, { passive: true });
    window.addEventListener("resize", checkScrollEnd);
    checkScrollEnd();

    return () => {
      window.removeEventListener("scroll", checkScrollEnd);
      window.removeEventListener("resize", checkScrollEnd);
    };
  }, [articleId, bodyRef, enabled, tryOpen, wordCount]);

  return { open, dismiss };
}
