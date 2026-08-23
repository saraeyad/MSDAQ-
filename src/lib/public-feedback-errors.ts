import type { AxiosError } from "axios";

export function isPublicFeedbackRateLimited(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  return (error as AxiosError).response?.status === 429;
}

export function isPublicFeedbackNotFound(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  return (error as AxiosError).response?.status === 404;
}
