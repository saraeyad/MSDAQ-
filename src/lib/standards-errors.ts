import { getApiErrorMessage } from "@/lib/api-data";
import { isAxiosError } from "axios";

const STANDARDS_BUSY_MESSAGE = "الخدمة مشغولة — أعد المحاولة بعد قليل";

export function getStandardsCheckErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 429 || status === 503) {
      return STANDARDS_BUSY_MESSAGE;
    }
  }
  return getApiErrorMessage(error);
}
