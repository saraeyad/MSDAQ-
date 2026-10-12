import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import { ToolsVoice_APIs } from "@/services/api/tools";
import type { GeneratedAudio, StaffMediaType } from "@/types";
import type { AxiosError } from "axios";
import {
  clearPendingArticleNarrationId,
  readArticleTtsVoice,
  readPendingArticleNarrationId,
  writePendingArticleNarrationId,
} from "./tts-status-poll";

const BACKOFF_MS = [1_000, 2_000, 4_000, 8_000] as const;
const MAX_POLL_DURATION_MS = 40 * 60_000;
const MEDIA_CONFIRM_ATTEMPTS = 5;

class NarrationJobFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NarrationJobFailedError";
  }
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("aborted", "AbortError"));
      return;
    }
    const timer = window.setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException("aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function nextBackoffMs(pollIndex: number): number {
  const idx = Math.min(Math.max(pollIndex, 0), BACKOFF_MS.length - 1);
  return BACKOFF_MS[idx] ?? 8_000;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function isMissingAudio(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error != null &&
    (error as AxiosError).response?.status === 404
  );
}

async function articleHasNarration(
  articleId: number | string,
): Promise<boolean> {
  const media = await ArticlesStaff_APIs.getMedia(articleId);
  return !!media.generated_audio?.trim();
}

async function waitForGeneratedAudio(
  audioId: number,
  signal?: AbortSignal,
): Promise<GeneratedAudio> {
  const startedAt = Date.now();
  let pollIndex = 0;

  while (true) {
    if (signal?.aborted) throw new DOMException("aborted", "AbortError");
    if (Date.now() - startedAt >= MAX_POLL_DURATION_MS) {
      throw new Error("انتهت مهلة تجهيز النسخة الصوتية. لم يُنشر المقال.");
    }

    try {
      const status = await ToolsVoice_APIs.getGeneratedAudioStatus(audioId);
      if (status.status === "completed") {
        return ToolsVoice_APIs.getGeneratedAudio(audioId);
      }
      if (status.status === "failed") {
        throw new NarrationJobFailedError(
          status.error_message?.trim() ||
            "فشل تحويل النص إلى صوت. لم يُنشر المقال.",
        );
      }
    } catch (error) {
      if (isAbortError(error) || error instanceof NarrationJobFailedError) {
        throw error;
      }
      if (isMissingAudio(error)) throw error;
    }

    await sleep(nextBackoffMs(pollIndex), signal);
    pollIndex += 1;
  }
}

async function startNarration(
  articleId: number | string,
  voice: string,
  signal?: AbortSignal,
): Promise<GeneratedAudio> {
  const started = await ArticlesStaff_APIs.textToSpeech(
    articleId,
    voice ? { voice } : {},
  );
  writePendingArticleNarrationId(articleId, started.id);

  if (started.status === "failed") {
    clearPendingArticleNarrationId(articleId);
    throw new NarrationJobFailedError(
      started.error_message?.trim() ||
        "فشل تحويل النص إلى صوت. لم يُنشر المقال.",
    );
  }

  if (started.status === "completed") return started;
  return waitForGeneratedAudio(started.id, signal);
}

async function confirmNarrationSaved(
  articleId: number | string,
  signal?: AbortSignal,
): Promise<void> {
  for (let attempt = 0; attempt < MEDIA_CONFIRM_ATTEMPTS; attempt += 1) {
    if (await articleHasNarration(articleId)) return;
    if (attempt < MEDIA_CONFIRM_ATTEMPTS - 1) {
      await sleep(1_000, signal);
    }
  }
  throw new Error("تعذر تأكيد حفظ النسخة الصوتية. لم يُنشر المقال.");
}

/**
 * Text articles go live only after a narration file is saved.
 * A voice chosen in the publish flow is sent; otherwise the backend default is used.
 */
export async function ensureArticleNarrationSaved(
  articleId: number | string,
  options?: { mediaType?: StaffMediaType; voice?: string; signal?: AbortSignal },
): Promise<void> {
  const signal = options?.signal;
  let mediaType = options?.mediaType;
  if (!mediaType) {
    const article = await ArticlesStaff_APIs.getArticle(articleId);
    mediaType = article.media_type;
  }
  if (mediaType !== "text") return;
  if (signal?.aborted) throw new DOMException("aborted", "AbortError");

  if (await articleHasNarration(articleId)) {
    clearPendingArticleNarrationId(articleId);
    return;
  }

  const chosen = options?.voice?.trim() || readArticleTtsVoice(articleId);
  const pendingId = readPendingArticleNarrationId(articleId);
  let audio: GeneratedAudio | null = null;

  if (pendingId != null) {
    try {
      const existing = await ToolsVoice_APIs.getGeneratedAudio(pendingId);
      const sameVoice = !chosen || existing.voice === chosen;
      if (sameVoice && existing.status !== "failed") {
        audio =
          existing.status === "completed"
            ? existing
            : await waitForGeneratedAudio(pendingId, signal);
      } else {
        clearPendingArticleNarrationId(articleId);
      }
    } catch (error) {
      clearPendingArticleNarrationId(articleId);
      if (isAbortError(error)) throw error;
      if (!(error instanceof NarrationJobFailedError) && !isMissingAudio(error)) {
        throw error;
      }
      audio = null;
    }
  }

  if (!audio) {
    audio = await startNarration(articleId, chosen, signal);
  }

  if (audio.status !== "completed") {
    throw new Error("لم تكتمل النسخة الصوتية. لم يُنشر المقال.");
  }

  if (!audio.is_saved) {
    audio = await ToolsVoice_APIs.saveGeneratedAudio(audio.id, {
      name: "النسخة الصوتية",
    });
  }

  await confirmNarrationSaved(articleId, signal);
  clearPendingArticleNarrationId(articleId);
}
