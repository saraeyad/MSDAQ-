import {
  isTrustIndexDismissed,
  isTrustIndexTabActive,
  markTrustIndexDismissed,
  trustMediaThresholdReached,
  type TrustMediaProgress,
} from "@/lib/trust-index-labels";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseTrustIndexMediaTriggerOptions {
  articleId: number | string;
  enabled?: boolean;
  progress: TrustMediaProgress | null;
}

export function useTrustIndexMediaTrigger({
  articleId,
  enabled = true,
  progress,
}: UseTrustIndexMediaTriggerOptions) {
  const [open, setOpen] = useState(false);
  const playedMsRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  const triggeredRef = useRef(false);

  const dismiss = useCallback(() => {
    markTrustIndexDismissed(articleId);
    setOpen(false);
  }, [articleId]);

  const tryOpen = useCallback(
    (next: {
      playedSeconds: number;
      currentTime: number;
      duration: number;
      ended?: boolean;
    }) => {
      if (triggeredRef.current) return;
      if (isTrustIndexDismissed(articleId)) return;
      if (!trustMediaThresholdReached(next)) return;
      triggeredRef.current = true;
      setOpen(true);
    },
    [articleId],
  );

  useEffect(() => {
    triggeredRef.current = false;
    playedMsRef.current = 0;
    lastTickRef.current = null;
    setOpen(false);
  }, [articleId]);

  useEffect(() => {
    if (!enabled || !progress) return;

    tryOpen({
      playedSeconds: playedMsRef.current / 1000,
      currentTime: progress.currentTime,
      duration: progress.duration,
      ended: progress.ended,
    });

    const playing =
      progress.isPlaying && !progress.ended && isTrustIndexTabActive();

    if (!playing) {
      lastTickRef.current = null;
      return;
    }

    lastTickRef.current = performance.now();

    const tick = () => {
      if (!isTrustIndexTabActive()) {
        lastTickRef.current = null;
        return;
      }
      const now = performance.now();
      if (lastTickRef.current != null) {
        playedMsRef.current += now - lastTickRef.current;
      }
      lastTickRef.current = now;
      tryOpen({
        playedSeconds: playedMsRef.current / 1000,
        currentTime: progress.currentTime,
        duration: progress.duration,
        ended: progress.ended,
      });
    };

    const interval = window.setInterval(tick, 500);
    window.addEventListener("visibilitychange", tick);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("visibilitychange", tick);
    };
  }, [enabled, progress, tryOpen]);

  return { open, dismiss };
}
