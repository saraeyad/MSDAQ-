import {
  isTrustIndexDismissed,
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

function isMediaTabVisible(): boolean {
  if (typeof document === "undefined") return false;
  return document.visibilityState === "visible";
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
  const progressRef = useRef(progress);
  progressRef.current = progress;

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

  const evaluate = useCallback(() => {
    const current = progressRef.current;
    if (!current) return;
    tryOpen({
      playedSeconds: playedMsRef.current / 1000,
      currentTime: current.currentTime,
      duration: current.duration,
      ended: current.ended,
    });
  }, [tryOpen]);

  useEffect(() => {
    triggeredRef.current = false;
    playedMsRef.current = 0;
    lastTickRef.current = null;
    setOpen(false);
  }, [articleId]);

  useEffect(() => {
    if (!enabled || !progress) return;
    evaluate();
  }, [enabled, evaluate, progress]);

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      const current = progressRef.current;
      const playing =
        Boolean(current?.isPlaying) && !current?.ended && isMediaTabVisible();

      if (!playing) {
        lastTickRef.current = null;
        return;
      }

      const now = performance.now();
      if (lastTickRef.current != null) {
        playedMsRef.current += now - lastTickRef.current;
      }
      lastTickRef.current = now;
      evaluate();
    };

    const interval = window.setInterval(tick, 500);
    window.addEventListener("visibilitychange", tick);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("visibilitychange", tick);
    };
  }, [enabled, evaluate]);

  return { open, dismiss };
}
