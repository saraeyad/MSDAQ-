import { unwrapRecord } from "@/lib/api-data";
import type { StandaloneLocalizationResult } from "@/types";

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Normalize localization payloads from standalone or article endpoints. */
export function normalizeLocalizationResult(
  payload: unknown,
): StandaloneLocalizationResult {
  const data = unwrapRecord<Record<string, unknown>>(payload) ?? {};

  const content_simplified =
    readString(data.content_simplified) || readString(data.simplified);
  const content_dialect =
    readString(data.content_dialect) || readString(data.dialect);

  return { content_simplified, content_dialect };
}
