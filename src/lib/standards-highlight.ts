import {
  CRITERIA_WITH_SPANS,
  severityRank,
} from "@/lib/standards-normalize";
import type { StandardsCriterion, StandardsSpan } from "@/types";

export type HighlightSegmentKind = "text" | "highlight";

export interface HighlightSegment {
  kind: HighlightSegmentKind;
  text: string;
  severity?: StandardsSpan["severity"];
}

interface SpanMatch {
  start: number;
  end: number;
  span: StandardsSpan;
}

function findAllLiteralMatches(text: string, quote: string): number[] {
  if (!quote || !text) return [];
  const indices: number[] = [];
  let from = 0;
  while (from < text.length) {
    const index = text.indexOf(quote, from);
    if (index === -1) break;
    indices.push(index);
    from = index + Math.max(1, quote.length);
  }
  return indices;
}

export function findLiteralQuoteMatches(
  text: string,
  spans: StandardsSpan[],
): SpanMatch[] {
  const matches: SpanMatch[] = [];
  for (const span of spans) {
    for (const start of findAllLiteralMatches(text, span.quote)) {
      matches.push({
        start,
        end: start + span.quote.length,
        span,
      });
    }
  }
  return matches;
}

function resolveOverlaps(matches: SpanMatch[]): SpanMatch[] {
  const sorted = [...matches].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    const severityDiff =
      severityRank(b.span.severity) - severityRank(a.span.severity);
    if (severityDiff !== 0) return severityDiff;
    return b.end - b.start - (a.end - a.start);
  });

  const resolved: SpanMatch[] = [];
  for (const match of sorted) {
    const overlaps = resolved.some(
      (existing) => match.start < existing.end && match.end > existing.start,
    );
    if (!overlaps) resolved.push(match);
  }

  return resolved.sort((a, b) => a.start - b.start);
}

export function buildHighlightedSegments(
  text: string,
  spans: StandardsSpan[],
): HighlightSegment[] {
  if (!text) return [];
  if (!spans.length) return [{ kind: "text", text }];

  const matches = resolveOverlaps(findLiteralQuoteMatches(text, spans));
  if (!matches.length) return [{ kind: "text", text }];

  const segments: HighlightSegment[] = [];
  let cursor = 0;

  for (const match of matches) {
    if (match.start > cursor) {
      segments.push({ kind: "text", text: text.slice(cursor, match.start) });
    }
    segments.push({
      kind: "highlight",
      text: text.slice(match.start, match.end),
      severity: match.span.severity,
    });
    cursor = match.end;
  }

  if (cursor < text.length) {
    segments.push({ kind: "text", text: text.slice(cursor) });
  }

  return segments;
}

export function quoteExistsLiterally(text: string, quote: string): boolean {
  return quote.length > 0 && text.includes(quote);
}

export function spansForHeadline(criteria: StandardsCriterion[]): StandardsSpan[] {
  const headline = criteria.find((c) => c.key === "headline_neutral");
  return headline?.spans ?? [];
}

export function spansForBody(criteria: StandardsCriterion[]): StandardsSpan[] {
  const spans: StandardsSpan[] = [];
  for (const criterion of criteria) {
    if (criterion.key === "headline_neutral") continue;
    if (!CRITERIA_WITH_SPANS.includes(criterion.key as (typeof CRITERIA_WITH_SPANS)[number])) {
      continue;
    }
    if (criterion.spans?.length) spans.push(...criterion.spans);
  }
  return spans;
}
