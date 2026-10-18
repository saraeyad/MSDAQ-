import { unwrapList } from "@/lib/api";
import { normalizeCredibilityResult } from "./credibility-normalize";
import { normalizeStandardsResult } from "./standards-normalize";
import type {
  AiCheck,
  AiCheckStatus,
  AiCheckType,
  CredibilityCheckResult,
  StandardsCheckResult,
} from "@/types";

const STATUSES: AiCheckStatus[] = ["queued", "running", "done", "failed"];
const TYPES: AiCheckType[] = ["credibility", "standards"];

function toNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseStatus(value: unknown): AiCheckStatus {
  if (typeof value === "string" && STATUSES.includes(value as AiCheckStatus)) {
    return value as AiCheckStatus;
  }
  return "failed";
}

function parseType(value: unknown): AiCheckType {
  if (typeof value === "string" && TYPES.includes(value as AiCheckType)) {
    return value as AiCheckType;
  }
  return "credibility";
}

function parseResult(
  type: AiCheckType,
  raw: unknown,
): CredibilityCheckResult | StandardsCheckResult | null {
  if (!raw || typeof raw !== "object") return null;
  if (type === "credibility") {
    return normalizeCredibilityResult(raw as Record<string, unknown>);
  }
  return normalizeStandardsResult(raw as Record<string, unknown>);
}

/** Parse API `AiCheckResource` rows (single object or list item). */
export function normalizeAiCheck(raw: unknown): AiCheck | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = toNumber(row.id);
  const article_id = toNumber(row.article_id);
  if (id == null || article_id == null) return null;

  const type = parseType(row.type);
  const status = parseStatus(row.status);
  const resultRaw = row.result;

  let result: CredibilityCheckResult | StandardsCheckResult | null = null;
  if (status === "done" && resultRaw) {
    result = parseResult(type, resultRaw);
  }

  return {
    id,
    article_id,
    type,
    status,
    score: toNumber(row.score),
    result,
    error_message:
      typeof row.error_message === "string" ? row.error_message : null,
    reason: typeof row.reason === "string" ? row.reason : null,
    created_at:
      typeof row.created_at === "string" ? row.created_at : new Date(0).toISOString(),
    finished_at:
      typeof row.finished_at === "string" ? row.finished_at : null,
  };
}

/** Accept a bare array or a Laravel paginator `{ data: [...] }` payload. */
export function normalizeAiCheckList(raw: unknown): AiCheck[] {
  return unwrapList(raw)
    .map(normalizeAiCheck)
    .filter((row): row is AiCheck => row !== null);
}

export function isAiCheckInProgress(check: AiCheck): boolean {
  return check.status === "queued" || check.status === "running";
}

/**
 * Prefer an in-progress run (so a reload does not flash a stale `done` result),
 * otherwise the newest row by id / created_at.
 */
export function pickLatestAiCheck(checks: AiCheck[]): AiCheck | null {
  if (!checks.length) return null;
  const newestFirst = (a: AiCheck, b: AiCheck) => {
    if (b.id !== a.id) return b.id - a.id;
    return b.created_at.localeCompare(a.created_at);
  };
  const inProgress = checks.filter(isAiCheckInProgress).sort(newestFirst);
  if (inProgress[0]) return inProgress[0];
  return [...checks].sort(newestFirst)[0]!;
}

export const AI_CHECK_POLL_MS = 5_000;
