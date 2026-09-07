import {
  checkTranscriptStatusOnce,
  clearInflightTranscriptId,
  readInflightTranscriptId,
  resolveTranscriptOnLoad,
  startTranscriptStatusPoll,
  stopTranscriptStatusPoll,
  writeInflightTranscriptId,
} from "@/lib/transcript-status-poll";
import { Transcripts_APIs } from "@/services/api/transcripts";
import type { Transcript } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

export type TranscriptPollUiState =
  | { kind: "idle" }
  | { kind: "processing"; transcriptId: number }
  | { kind: "timed_out"; transcriptId: number }
  | { kind: "failed"; errorMessage: string | null; transcriptId: number }
  | { kind: "completed"; transcript: Transcript };

interface UseTranscriptStatusPollOptions {
  storageKey: string;
  onCompleted?: (transcript: Transcript) => void;
  onFailed?: (errorMessage: string | null) => void;
  onProcessing?: (transcriptId: number) => void;
}

export function useTranscriptStatusPoll({
  storageKey,
  onCompleted,
  onFailed,
  onProcessing,
}: UseTranscriptStatusPollOptions) {
  const [uiState, setUiState] = useState<TranscriptPollUiState>({ kind: "idle" });
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
    async (transcriptId: number) => {
      const transcript = await Transcripts_APIs.get(transcriptId);
      clearInflightTranscriptId(storageKey);
      activeIdRef.current = null;
      setUiState({ kind: "completed", transcript });
      onCompletedRef.current?.(transcript);
    },
    [storageKey],
  );

  const handleFailed = useCallback(
    (errorMessage: string | null, transcriptId: number) => {
      clearInflightTranscriptId(storageKey);
      activeIdRef.current = null;
      setUiState({ kind: "failed", errorMessage, transcriptId });
      onFailedRef.current?.(errorMessage);
    },
    [storageKey],
  );

  const startPolling = useCallback(
    (transcriptId: number) => {
      activeIdRef.current = transcriptId;
      setUiState({ kind: "processing", transcriptId });
      writeInflightTranscriptId(storageKey, transcriptId);
      onProcessingRef.current?.(transcriptId);

      startTranscriptStatusPoll(transcriptId, {
        onCompleted: handleCompleted,
        onFailed: (errorMessage) => handleFailed(errorMessage, transcriptId),
        onTimedOut: () => {
          setUiState({ kind: "timed_out", transcriptId });
        },
      });
    },
    [storageKey, handleCompleted, handleFailed],
  );

  const trackTranscript = useCallback(
    (transcript: Transcript) => {
      if (transcript.status === "completed") {
        clearInflightTranscriptId(storageKey);
        activeIdRef.current = null;
        setUiState({ kind: "completed", transcript });
        onCompletedRef.current?.(transcript);
        return;
      }

      if (transcript.status === "failed") {
        clearInflightTranscriptId(storageKey);
        activeIdRef.current = null;
        setUiState({
          kind: "failed",
          errorMessage: transcript.error_message ?? null,
          transcriptId: transcript.id,
        });
        onFailedRef.current?.(transcript.error_message ?? null);
        return;
      }

      startPolling(transcript.id);
    },
    [storageKey, startPolling],
  );

  const resumeIfStored = useCallback(async () => {
    const id = readInflightTranscriptId(storageKey);
    if (id == null) return;

    try {
      const result = await resolveTranscriptOnLoad(id);

      if (result.action === "completed") {
        clearInflightTranscriptId(storageKey);
        activeIdRef.current = null;
        setUiState({ kind: "completed", transcript: result.transcript });
        onCompletedRef.current?.(result.transcript);
        return;
      }

      if (result.action === "failed") {
        clearInflightTranscriptId(storageKey);
        activeIdRef.current = null;
        setUiState({
          kind: "failed",
          errorMessage: result.errorMessage,
          transcriptId: id,
        });
        onFailedRef.current?.(result.errorMessage);
        return;
      }

      startPolling(id);
    } catch {
      clearInflightTranscriptId(storageKey);
    }
  }, [storageKey, startPolling]);

  useEffect(() => {
    void resumeIfStored();

    return () => {
      if (activeIdRef.current != null) {
        stopTranscriptStatusPoll(activeIdRef.current);
      }
    };
  }, [resumeIfStored]);

  const manualRecheck = useCallback(async () => {
    const id =
      uiState.kind === "timed_out" || uiState.kind === "failed"
        ? uiState.transcriptId
        : (activeIdRef.current ?? readInflightTranscriptId(storageKey));

    if (id == null) return;

    setRechecking(true);
    try {
      const result = await checkTranscriptStatusOnce(id);

      if (result.status === "completed") {
        clearInflightTranscriptId(storageKey);
        activeIdRef.current = null;
        setUiState({ kind: "completed", transcript: result.transcript });
        onCompletedRef.current?.(result.transcript);
        return;
      }

      if (result.status === "failed") {
        clearInflightTranscriptId(storageKey);
        activeIdRef.current = null;
        setUiState({
          kind: "failed",
          errorMessage: result.errorMessage,
          transcriptId: id,
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
      stopTranscriptStatusPoll(activeIdRef.current);
    }
    clearInflightTranscriptId(storageKey);
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
    trackTranscript,
    manualRecheck,
    resetPoll,
  };
}
