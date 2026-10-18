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

function coerceResultPayload(raw: unknown): unknown {
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    try {
      return JSON.parse(trimmed) as unknown;
    } catch {
      return null;
    }
  }
  return raw;
}

function parseResult(
  type: AiCheckType,
  raw: unknown,
): CredibilityCheckResult | StandardsCheckResult | null {
  const payload = coerceResultPayload(raw);
  if (!payload || typeof payload !== "object") return null;
  if (type === "credibility") {
    return normalizeCredibilityResult(payload as Record<string, unknown>);
  }
  return normalizeStandardsResult(payload as Record<string, unknown>);
}

/** Parse API `AiCheckResource` rows (single object or list item). */
export function normalizeAiCheck(
  raw: unknown,
  fallbackArticleId?: number | null,
): AiCheck | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = toNumber(row.id);
  const article_id =
    toNumber(row.article_id) ??
    (fallbackArticleId != null && Number.isFinite(fallbackArticleId)
      ? fallbackArticleId
      : null);
  if (id == null || article_id == null) return null;

  const type = parseType(row.type);
  const resultRaw = row.result;
  const status =
    row.status == null && resultRaw ? "done" : parseStatus(row.status);

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

function rawCheckRows(raw: unknown): unknown[] {
  const list = unwrapList(raw);
  if (list.length) return list;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
  const record = raw as Record<string, unknown>;
  for (const key of ["ai_checks", "checks", "items"]) {
    if (Array.isArray(record[key])) return record[key];
  }
  // History GET may return the latest saved row as one object, not an array.
  if ("id" in record || "result" in record || "status" in record) return [raw];
  return [];
}

/** Accept a list, a Laravel paginator, or one saved check object. */
export function normalizeAiCheckList(
  raw: unknown,
  fallbackArticleId?: number | null,
): AiCheck[] {
  return rawCheckRows(raw)
    .map((item) => normalizeAiCheck(item, fallbackArticleId))
    .filter((row): row is AiCheck => row !== null);
}

export function isAiCheckInProgress(check: AiCheck): boolean {
  return check.status === "queued" || check.status === "running";
}

/**
 * Prefer an in-progress run (so a reload does not flash a stale `done` result),
 * otherwise the newest row by id / created_at.
 * When `type` is set, ignore rows of the other check type.
 */
export function pickLatestAiCheck(
  checks: AiCheck[],
  type?: AiCheckType,
): AiCheck | null {
  const scoped = type ? checks.filter((row) => row.type === type) : checks;
  if (!scoped.length) return null;
  const newestFirst = (a: AiCheck, b: AiCheck) => {
    if (b.id !== a.id) return b.id - a.id;
    return b.created_at.localeCompare(a.created_at);
  };
  const inProgress = scoped.filter(isAiCheckInProgress).sort(newestFirst);
  if (inProgress[0]) return inProgress[0];
  return [...scoped].sort(newestFirst)[0]!;
}

export const AI_CHECK_POLL_MS = 5_000;
