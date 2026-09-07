import { Transcripts_APIs } from "@/services/api/transcripts";
import type { Transcript, TranscriptStatus } from "@/types";

export const STT_INFLIGHT_STANDALONE_KEY = "stt-inflight:standalone";

export function sttInflightArticleKey(articleId: number | string): string {
  return `stt-inflight:article:${articleId}`;
}

export function readInflightTranscriptId(storageKey: string): number | null {
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return null;
    const id = Number(raw);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}

export function writeInflightTranscriptId(storageKey: string, id: number): void {
  try {
    sessionStorage.setItem(storageKey, String(id));
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearInflightTranscriptId(storageKey: string): void {
  try {
    sessionStorage.removeItem(storageKey);
  } catch {
    /* ignore */
  }
}

const POLL_PHASES = [
  { until: 60_000, interval: 5_000 },
  { until: 5 * 60_000, interval: 15_000 },
  { until: 40 * 60_000, interval: 30_000 },
] as const;

export interface TranscriptStatusPollCallbacks {
  onStatus?: (status: TranscriptStatus["status"]) => void;
  onCompleted: (transcriptId: number) => void | Promise<void>;
  onFailed: (errorMessage: string | null) => void;
  onTimedOut: () => void;
}

const activeControllers = new Map<number, AbortController>();

function getPhaseInterval(elapsedMs: number): number | null {
  const phase = POLL_PHASES.find((p) => elapsedMs < p.until);
  return phase?.interval ?? null;
}

export function stopTranscriptStatusPoll(transcriptId: number): void {
  const controller = activeControllers.get(transcriptId);
  if (controller) {
    controller.abort();
    activeControllers.delete(transcriptId);
  }
}

export function startTranscriptStatusPoll(
  transcriptId: number,
  callbacks: TranscriptStatusPollCallbacks,
): AbortController {
  stopTranscriptStatusPoll(transcriptId);

  const controller = new AbortController();
  activeControllers.set(transcriptId, controller);
  const startedAt = Date.now();
  const { signal } = controller;

  const schedule = (delayMs: number) => {
    if (signal.aborted) return;
    window.setTimeout(tick, delayMs);
  };

  async function tick() {
    if (signal.aborted) return;

    const elapsed = Date.now() - startedAt;
    const interval = getPhaseInterval(elapsed);

    if (interval === null) {
      activeControllers.delete(transcriptId);
      callbacks.onTimedOut();
      return;
    }

    if (document.hidden) {
      schedule(interval);
      return;
    }

    try {
      const data = await Transcripts_APIs.getStatus(transcriptId);
      if (signal.aborted) return;

      callbacks.onStatus?.(data.status);

      if (data.status === "completed") {
        activeControllers.delete(transcriptId);
        await callbacks.onCompleted(transcriptId);
        return;
      }

      if (data.status === "failed") {
        activeControllers.delete(transcriptId);
        callbacks.onFailed(data.error_message ?? null);
        return;
      }

      schedule(interval);
    } catch {
      if (signal.aborted) return;
      schedule(interval);
    }
  }

  void tick();
  return controller;
}

export async function resolveTranscriptOnLoad(transcriptId: number): Promise<
  | { action: "completed"; transcript: Transcript }
  | { action: "failed"; errorMessage: string | null }
  | { action: "processing" }
> {
  const status = await Transcripts_APIs.getStatus(transcriptId);

  if (status.status === "completed") {
    const transcript = await Transcripts_APIs.get(transcriptId);
    return { action: "completed", transcript };
  }

  if (status.status === "failed") {
    return { action: "failed", errorMessage: status.error_message ?? null };
  }

  return { action: "processing" };
}

export async function checkTranscriptStatusOnce(transcriptId: number): Promise<
  | { status: "completed"; transcript: Transcript }
  | { status: "failed"; errorMessage: string | null }
  | { status: "processing" }
> {
  const result = await resolveTranscriptOnLoad(transcriptId);

  if (result.action === "completed") {
    return { status: "completed", transcript: result.transcript };
  }

  if (result.action === "failed") {
    return { status: "failed", errorMessage: result.errorMessage };
  }

  return { status: "processing" };
}
