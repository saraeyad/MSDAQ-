import type { AxiosProgressEvent } from "axios";

export type FileUploadProgressStatus = "uploading" | "complete" | "failed";

export interface FileUploadProgressState {
  status: FileUploadProgressStatus;
  progress: number;
  error?: string;
}

export function uploadPercentFromEvent(event: AxiosProgressEvent): number {
  if (!event.total) return 0;
  return Math.min(99, Math.round((event.loaded * 100) / event.total));
}
