import { ToolsVoice_APIs } from "@/services/api/tools";
import type { GeneratedAudio, GeneratedAudioStatus } from "@/types";

export const TTS_INFLIGHT_STANDALONE_KEY = "tts-inflight:standalone";

export function ttsInflightArticleKey(articleId: number | string): string {
  return `tts-inflight:article:${articleId}`;
}

function articleTtsVoiceKey(articleId: number | string): string {
  return `tts-voice:article:${articleId}`;
}

export function readArticleTtsVoice(articleId: number | string): string {
  try {
    return sessionStorage.getItem(articleTtsVoiceKey(articleId))?.trim() ?? "";
  } catch {
    return "";
  }
}

export function writeArticleTtsVoice(
  articleId: number | string,
  voice: string,
): void {
  try {
    const slug = voice.trim();
    if (!slug) {
      sessionStorage.removeItem(articleTtsVoiceKey(articleId));
      return;
    }
    sessionStorage.setItem(articleTtsVoiceKey(articleId), slug);
  } catch {
    /* ignore quota / private mode */
  }
}

export function readInflightGeneratedAudioId(storageKey: string): number | null {
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return null;
    const id = Number(raw);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}

export function writeInflightGeneratedAudioId(
  storageKey: string,
  id: number,
): void {
  try {
    sessionStorage.setItem(storageKey, String(id));
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearInflightGeneratedAudioId(storageKey: string): void {
  try {
    sessionStorage.removeItem(storageKey);
  } catch {
    /* ignore */
  }
}

/** Status is checked on a fixed interval, not a short backoff. */
export const TTS_STATUS_POLL_MS = 10_000;
const MAX_POLL_DURATION_MS = 40 * 60_000;

export interface TtsStatusPollCallbacks {
  onStatus?: (status: GeneratedAudioStatus) => void;
  onCompleted: (audioId: number) => void | Promise<void>;
  onFailed: (errorMessage: string | null) => void;
  onTimedOut: () => void;
}

const activeControllers = new Map<number, AbortController>();

export function stopTtsStatusPoll(audioId: number): void {
  const controller = activeControllers.get(audioId);
  if (controller) {
    controller.abort();
    activeControllers.delete(audioId);
  }
}

export function startTtsStatusPoll(
  audioId: number,
  callbacks: TtsStatusPollCallbacks,
): AbortController {
  stopTtsStatusPoll(audioId);

  const controller = new AbortController();
  activeControllers.set(audioId, controller);
  const startedAt = Date.now();
  const { signal } = controller;

  const schedule = (delayMs: number) => {
    if (signal.aborted) return;
    window.setTimeout(tick, delayMs);
  };

  async function tick() {
    if (signal.aborted) return;

    const elapsed = Date.now() - startedAt;
    if (elapsed >= MAX_POLL_DURATION_MS) {
      activeControllers.delete(audioId);
      callbacks.onTimedOut();
      return;
    }

    if (document.hidden) {
      schedule(TTS_STATUS_POLL_MS);
      return;
    }

    try {
      const data = await ToolsVoice_APIs.getGeneratedAudioStatus(audioId);
      if (signal.aborted) return;

      callbacks.onStatus?.(data);

      if (data.status === "completed") {
        activeControllers.delete(audioId);
        await callbacks.onCompleted(audioId);
        return;
      }

      if (data.status === "failed") {
        activeControllers.delete(audioId);
        callbacks.onFailed(data.error_message ?? null);
        return;
      }

      schedule(TTS_STATUS_POLL_MS);
    } catch {
      if (signal.aborted) return;
      schedule(TTS_STATUS_POLL_MS);
    }
  }

  schedule(TTS_STATUS_POLL_MS);
  return controller;
}

export async function resolveGeneratedAudioOnLoad(audioId: number): Promise<
  | { action: "completed"; audio: GeneratedAudio }
  | { action: "failed"; errorMessage: string | null }
  | { action: "processing"; status: GeneratedAudioStatus }
> {
  const status = await ToolsVoice_APIs.getGeneratedAudioStatus(audioId);

  if (status.status === "completed") {
    const audio = await ToolsVoice_APIs.getGeneratedAudio(audioId);
    return { action: "completed", audio };
  }

  if (status.status === "failed") {
    return { action: "failed", errorMessage: status.error_message ?? null };
  }

  return { action: "processing", status };
}

export async function checkGeneratedAudioStatusOnce(audioId: number): Promise<
  | { status: "completed"; audio: GeneratedAudio }
  | { status: "failed"; errorMessage: string | null }
  | { status: "processing"; pollStatus: GeneratedAudioStatus }
> {
  const result = await resolveGeneratedAudioOnLoad(audioId);

  if (result.action === "completed") {
    return { status: "completed", audio: result.audio };
  }

  if (result.action === "failed") {
    return { status: "failed", errorMessage: result.errorMessage };
  }

  return { status: "processing", pollStatus: result.status };
}
