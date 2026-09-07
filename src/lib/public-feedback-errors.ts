import type { AxiosError } from "axios";

export function isPublicFeedbackRateLimited(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  return (error as AxiosError).response?.status === 429;
}

export function isPublicFeedbackNotFound(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  return (error as AxiosError).response?.status === 404;
}

export function isPublicFeedbackClosed(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const axiosError = error as AxiosError<{
    message?: string;
    errors?: unknown;
  }>;
  const status = axiosError.response?.status;
  if (status === 403 || status === 409) return true;
  if (status !== 422) return false;
  if (axiosError.response?.data?.errors) return false;
  const message = String(axiosError.response?.data?.message ?? "");
  return /limit|حد|استقبال|مغلق|closed/i.test(message);
}
