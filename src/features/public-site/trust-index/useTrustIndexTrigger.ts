import {
  isTrustIndexDismissed,
  markTrustIndexDismissed,
} from "@/lib/site";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseTrustIndexTriggerOptions {
  articleId: number | string;
  /** Element at the real end of the article (after body, gallery, sources). */
  endEl: HTMLElement | null;
  enabled?: boolean;
}

function isArticleEndInView(node: HTMLElement): boolean {
  const rect = node.getBoundingClientRect();
  return rect.top < window.innerHeight - 48;
}

export function useTrustIndexTrigger({
  articleId,
  endEl,
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
    if (!enabled || !endEl) return;

    let wasBelowFold = !isArticleEndInView(endEl);

    const check = () => {
      if (!isArticleEndInView(endEl)) {
        wasBelowFold = true;
        return;
      }
      if (wasBelowFold || window.scrollY > 40) {
        tryOpen();
      }
    };

    const observer = new IntersectionObserver(() => check(), {
      root: null,
      threshold: 0,
    });
    observer.observe(endEl);
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    check();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [articleId, enabled, endEl, tryOpen]);

  return { open, dismiss };
}
