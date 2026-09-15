import {
  checkGeneratedAudioStatusOnce,
  clearInflightGeneratedAudioId,
  readInflightGeneratedAudioId,
  resolveGeneratedAudioOnLoad,
  startTtsStatusPoll,
  stopTtsStatusPoll,
  writeInflightGeneratedAudioId,
} from "@/lib/publishing";
import { ToolsVoice_APIs } from "@/services/api/tools";
import type { GeneratedAudio, GeneratedAudioStatus } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

export type TtsPollUiState =
  | { kind: "idle" }
  | {
      kind: "processing";
      audioId: number;
      pollStatus?: GeneratedAudioStatus | null;
    }
  | { kind: "timed_out"; audioId: number }
  | { kind: "failed"; errorMessage: string | null; audioId: number }
  | { kind: "completed"; audio: GeneratedAudio };

interface UseTtsStatusPollOptions {
  storageKey: string;
  onCompleted?: (audio: GeneratedAudio) => void;
  onFailed?: (errorMessage: string | null) => void;
  onProcessing?: (audioId: number) => void;
}

export function useTtsStatusPoll({
  storageKey,
  onCompleted,
  onFailed,
  onProcessing,
}: UseTtsStatusPollOptions) {
  const [uiState, setUiState] = useState<TtsPollUiState>({ kind: "idle" });
  const [rechecking, setRechecking] = useState(false);
  const activeIdRef = useRef<number | null>(null);
  const onCompletedRef = useRef(onCompleted);
  const onFailedRef = useRef(onFailed);
  const onProcessingRef = useRef(onProcessing);

  useEffect(() => {
    onCompletedRef.current = onCompleted;
    onFailedRef.current = onFailed;
    onProcessingRef.current = onProcessing;
  }, [onCompleted, onFailed, onProcessing]);

  const handleCompleted = useCallback(
    async (audioId: number) => {
      const audio = await ToolsVoice_APIs.getGeneratedAudio(audioId);
      clearInflightGeneratedAudioId(storageKey);
      activeIdRef.current = null;
      setUiState({ kind: "completed", audio });
      onCompletedRef.current?.(audio);
    },
    [storageKey],
  );

  const handleFailed = useCallback(
    (errorMessage: string | null, audioId: number) => {
      clearInflightGeneratedAudioId(storageKey);
      activeIdRef.current = null;
      setUiState({ kind: "failed", errorMessage, audioId });
      onFailedRef.current?.(errorMessage);
    },
    [storageKey],
  );

  const startPolling = useCallback(
    (audioId: number) => {
      activeIdRef.current = audioId;
      setUiState({ kind: "processing", audioId, pollStatus: null });
      writeInflightGeneratedAudioId(storageKey, audioId);
      onProcessingRef.current?.(audioId);

      startTtsStatusPoll(audioId, {
        onStatus: (status) => {
          setUiState((prev) =>
            prev.kind === "processing" && prev.audioId === audioId
              ? { ...prev, pollStatus: status }
              : prev,
          );
        },
        onCompleted: handleCompleted,
        onFailed: (errorMessage) => handleFailed(errorMessage, audioId),
        onTimedOut: () => {
          setUiState({ kind: "timed_out", audioId });
        },
      });
    },
    [storageKey, handleCompleted, handleFailed],
  );

  const trackAudio = useCallback(
    (audio: GeneratedAudio) => {
      if (audio.status === "completed") {
        clearInflightGeneratedAudioId(storageKey);
        activeIdRef.current = null;
        setUiState({ kind: "completed", audio });
        onCompletedRef.current?.(audio);
        return;
      }

      if (audio.status === "failed") {
        clearInflightGeneratedAudioId(storageKey);
        activeIdRef.current = null;
        setUiState({
          kind: "failed",
          errorMessage: audio.error_message ?? null,
          audioId: audio.id,
        });
        onFailedRef.current?.(audio.error_message ?? null);
        return;
      }

      startPolling(audio.id);
    },
    [storageKey, startPolling],
  );

  const resumeIfStored = useCallback(async () => {
    const id = readInflightGeneratedAudioId(storageKey);
    if (id == null) return;

    try {
      const result = await resolveGeneratedAudioOnLoad(id);

      if (result.action === "completed") {
        clearInflightGeneratedAudioId(storageKey);
        activeIdRef.current = null;
        setUiState({ kind: "completed", audio: result.audio });
        onCompletedRef.current?.(result.audio);
        return;
      }

      if (result.action === "failed") {
        clearInflightGeneratedAudioId(storageKey);
        activeIdRef.current = null;
        setUiState({
          kind: "failed",
          errorMessage: result.errorMessage,
          audioId: id,
        });
        onFailedRef.current?.(result.errorMessage);
        return;
      }

      startPolling(id);
    } catch {
      clearInflightGeneratedAudioId(storageKey);
    }
  }, [storageKey, startPolling]);

  useEffect(() => {
    void resumeIfStored();

    return () => {
      if (activeIdRef.current != null) {
        stopTtsStatusPoll(activeIdRef.current);
      }
    };
  }, [resumeIfStored]);

  const manualRecheck = useCallback(async () => {
    const id =
      uiState.kind === "timed_out" || uiState.kind === "failed"
        ? uiState.audioId
        : (activeIdRef.current ?? readInflightGeneratedAudioId(storageKey));

    if (id == null) return;

    setRechecking(true);
    try {
      const result = await checkGeneratedAudioStatusOnce(id);

      if (result.status === "completed") {
        clearInflightGeneratedAudioId(storageKey);
        activeIdRef.current = null;
        setUiState({ kind: "completed", audio: result.audio });
        onCompletedRef.current?.(result.audio);
        return;
      }

      if (result.status === "failed") {
        clearInflightGeneratedAudioId(storageKey);
        activeIdRef.current = null;
        setUiState({
          kind: "failed",
          errorMessage: result.errorMessage,
          audioId: id,
        });
        onFailedRef.current?.(result.errorMessage);
        return;
      }

      startPolling(id);
    } catch {
      /* keep current UI state */
    } finally {
      setRechecking(false);
    }
  }, [storageKey, startPolling, uiState]);

  const resetPoll = useCallback(() => {
    if (activeIdRef.current != null) {
      stopTtsStatusPoll(activeIdRef.current);
    }
    clearInflightGeneratedAudioId(storageKey);
    activeIdRef.current = null;
    setUiState({ kind: "idle" });
  }, [storageKey]);

  const isProcessing = uiState.kind === "processing";

  return {
    uiState,
    isProcessing,
    isAwaitingResult:
      uiState.kind === "processing" || uiState.kind === "timed_out",
    rechecking,
    trackAudio,
    manualRecheck,
    resetPoll,
  };
}
