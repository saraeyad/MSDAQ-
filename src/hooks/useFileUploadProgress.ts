import {
  uploadPercentFromEvent,
  type FileUploadProgressState,
} from "@/lib/upload-progress";
import type { AxiosProgressEvent } from "axios";
import { useCallback, useState } from "react";

export function useFileUploadProgress() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<FileUploadProgressState | null>(
    null,
  );

  const start = useCallback((next: File) => {
    setFile(next);
    setProgress({ status: "uploading", progress: 0 });
  }, []);

  const onUploadProgress = useCallback((event: AxiosProgressEvent) => {
    setProgress({
      status: "uploading",
      progress: uploadPercentFromEvent(event),
    });
  }, []);

  const complete = useCallback(() => {
    setProgress({ status: "complete", progress: 100 });
  }, []);

  const fail = useCallback((error: string) => {
    setProgress({ status: "failed", progress: 0, error });
  }, []);

  const reset = useCallback(() => {
    setFile(null);
    setProgress(null);
  }, []);

  return {
    file,
    progress,
    start,
    onUploadProgress,
    complete,
    fail,
    reset,
  };
}
