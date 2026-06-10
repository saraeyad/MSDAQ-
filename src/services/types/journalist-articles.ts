import { resolveApiMediaUrl } from "@/lib/media-url";
import type {
  JournalistArticle,
  JournalistArticleSource,
  JournalistArticleStatus,
  PublishReadiness,
  StandardsBreakdownItem,
  StandardsCheckResult,
} from "@/types/journalist-article";
import type { ApiResponse } from "./api";

export type ApiJournalistRef = {
  id: number;
  name: string;
};

export type ApiStandardsBreakdownEntry =
  | {
      passed: boolean;
      feedback: string;
    }
  | {
      score: number;
      feedback: string;
    };

export type ApiArticleSource = {
  id: number;
  source_type: string;
  source?: string | null;
  is_verified?: boolean;
  verified_at?: string | null;
  consent?: {
    name: string;
    status: "pending" | "approved" | "rejected";
    consent_approved_at?: string | null;
  } | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  quote?: string | null;
};

export type ApiJournalistArticle = {
  id: number;
  title: string;
  status: string;
  cover_image?: string | null;
  content_formal: string;
  content_simplified?: string | null;
  content_dialect?: string | null;
  trust_score?: number | null;
  fusha_passed?: boolean | null;
  standards_breakdown?: Record<string, ApiStandardsBreakdownEntry> | null;
  credibility_score?: number | null;
  credibility_breakdown?: Record<string, unknown> | null;
  is_publishable?: boolean;
  journalist?: ApiJournalistRef;
  published_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  rejection_reason?: string | null;
  sources?: ApiArticleSource[];
};

export type ApiStandardsCheckData = {
  fusha_passed: boolean;
  total_score: number;
  breakdown: Record<string, ApiStandardsBreakdownEntry>;
};

export type JournalistArticlesListResponse = ApiResponse<ApiJournalistArticle[]>;
export type JournalistArticleResponse = ApiResponse<ApiJournalistArticle>;
export type StandardsCheckResponse = ApiResponse<ApiStandardsCheckData>;
export type ArticleSourceResponse = ApiResponse<ApiArticleSource>;
export type PublishArticleResponse = ApiResponse<null>;

export type CreateArticlePayload = {
  title: string;
  content_formal: string;
  tags?: string[];
  cover_image?: File | null;
};

export type UpdateArticlePayload = CreateArticlePayload;

export type AddArticleSourcePayload = {
  source_type: string;
  source?: string;
  name?: string;
  email?: string;
  phone?: string;
  quote?: string;
};

export const PUBLISH_TRUST_THRESHOLD = 65;

export function isHumanSource(source: JournalistArticleSource): boolean {
  return source.type === "person" || source.sourceType === "human";
}

export function mergeArticleSources(
  existing: JournalistArticleSource[],
  incoming?: JournalistArticleSource[],
  sourcesLoadedFromApi?: boolean,
): JournalistArticleSource[] {
  if (!sourcesLoadedFromApi) return existing;
  return incoming ?? existing;
}

export function computePublishReadiness(input: {
  sources: JournalistArticleSource[];
  fushaPassed?: boolean | null;
  trustScore?: number | null;
  checkResult?: StandardsCheckResult | null;
  isPublishable?: boolean;
}): PublishReadiness {
  const fushaPassed =
    input.checkResult?.fushaCompliant ?? input.fushaPassed === true;
  const trustScore =
    input.checkResult?.trustScore ?? input.trustScore ?? null;

  const humanSources = input.sources.filter(isHumanSource);
  const pendingCount = humanSources.filter(
    (s) => s.consent?.status === "pending",
  ).length;
  const rejectedCount = humanSources.filter(
    (s) => s.consent?.status === "rejected",
  ).length;
  // A human source without any consent object means WhatsApp hasn't been sent
  // yet OR we lost the status on refresh — treat as pending only if the backend
  // hasn't already declared the article publishable.
  const missingConsentCount =
    input.isPublishable === true
      ? 0
      : humanSources.filter((s) => !s.consent).length;
  const unapprovedHuman = humanSources.filter(
    (s) => s.consent?.status !== "approved",
  ).length;

  const consentApplicable = humanSources.length > 0;

  // Publish logic: no human sources means consent cannot block publishing.
  const consentPassed =
    input.isPublishable === true ||
    !consentApplicable ||
    (pendingCount === 0 &&
      rejectedCount === 0 &&
      missingConsentCount === 0 &&
      unapprovedHuman === 0);

  // Checklist display: unchecked on a brand-new article; checked when only
  // non-human sources exist (consent not required).
  const consentDisplayPassed = consentApplicable
    ? consentPassed
    : input.sources.length > 0;

  const gates: PublishReadiness["gates"] = {
    fusha: {
      passed: fushaPassed,
    },
    trustScore: {
      passed: trustScore !== null && trustScore >= PUBLISH_TRUST_THRESHOLD,
      currentScore: trustScore,
    },
    hasSource: {
      passed: input.sources.length > 0,
    },
    humanConsent: {
      passed: consentPassed,
      displayPassed: consentDisplayPassed,
      pendingCount: pendingCount + missingConsentCount,
      rejectedCount,
    },
  };

  // If the backend explicitly marks it publishable, honour that — the API has
  // ground truth on consent state that our local cache may not reflect.
  const canPublish =
    input.isPublishable === true ||
    Object.values(gates).every((gate) => gate.passed);

  return { canPublish, gates };
}

function normalizeStatus(status: string): JournalistArticleStatus {
  if (status === "published") return "published";
  if (status === "rejected") return "rejected";
  if (status === "pending") return "pending";
  return "draft";
}

function mapSourceType(sourceType: string): JournalistArticleSource["type"] {
  if (sourceType === "human") return "person";
  if (
    sourceType === "url" ||
    sourceType === "document" ||
    sourceType === "person" ||
    sourceType === "anonymous" ||
    sourceType === "organization" ||
    sourceType === "public_figure"
  ) {
    return sourceType;
  }
  return "url";
}

export function mapApiSource(source: ApiArticleSource): JournalistArticleSource {
  const label =
    source.consent?.name ??
    source.name ??
    source.source ??
    `#${source.id}`;

  return {
    id: source.id,
    label,
    type: mapSourceType(source.source_type),
    url: source.source ?? undefined,
    sourceType: source.source_type,
    isVerified: source.is_verified,
    verifiedAt: source.verified_at ?? undefined,
    consent: source.consent ?? undefined,
    name: source.name ?? undefined,
    email: source.email ?? undefined,
    phone: source.phone ?? undefined,
    quote: source.quote ?? undefined,
  };
}

export function mapApiArticle(article: ApiJournalistArticle): JournalistArticle {
  return {
    id: article.id,
    title: article.title,
    content: article.content_formal,
    status: normalizeStatus(article.status),
    coverImage: resolveApiMediaUrl(article.cover_image),
    coverImageRaw: article.cover_image ?? null,
    trustScore: article.trust_score ?? null,
    credibilityScore: article.credibility_score ?? null,
    fushaPassed: article.fusha_passed ?? null,
    standardsBreakdown: article.standards_breakdown ?? null,
    isPublishable: article.is_publishable ?? false,
    rejectionReason: article.rejection_reason ?? undefined,
    sources:
      article.sources !== undefined
        ? article.sources.map(mapApiSource)
        : [],
    sourcesLoadedFromApi: article.sources !== undefined,
    journalist: article.journalist,
    createdAt: article.created_at,
    updatedAt: article.updated_at ?? article.created_at,
    publishedAt: article.published_at ?? undefined,
  };
}

function mapBreakdownEntry(
  key: string,
  entry: ApiStandardsBreakdownEntry,
): StandardsBreakdownItem {
  if ("passed" in entry) {
    return {
      key,
      label: key,
      passed: entry.passed,
      feedback: entry.feedback,
    };
  }

  return {
    key,
    label: key,
    score: entry.score,
    feedback: entry.feedback,
  };
}

export function mapStandardsCheckResult(
  data: ApiStandardsCheckData,
): StandardsCheckResult {
  const breakdown = Object.entries(data.breakdown).map(([key, entry]) =>
    mapBreakdownEntry(key, entry),
  );

  return {
    trustScore: data.total_score,
    credibilityScore: null,
    fushaCompliant: data.fusha_passed,
    dialectDetected: !data.fusha_passed,
    canPublish:
      data.fusha_passed && data.total_score >= PUBLISH_TRUST_THRESHOLD,
    breakdown,
    issues: data.fusha_passed ? [] : ["fusha"],
  };
}

export function toApiSourceType(type: JournalistArticleSource["type"]): string {
  return type;
}

function normalizeSourceUrl(url: string | undefined): string | undefined {
  const trimmed = url?.trim();
  if (!trimmed) return undefined;
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export function buildAddSourcePayload(source: {
  type: JournalistArticleSource["type"];
  url?: string;
  name?: string;
  email?: string;
  phone?: string;
  quote?: string;
  label?: string;
}): AddArticleSourcePayload {
  const sourceType = toApiSourceType(source.type);

  if (source.type === "person") {
    const phone = source.phone?.trim();
    return {
      source_type: sourceType,
      source: phone,
      name: source.name?.trim(),
      email: source.email?.trim(),
      phone,
      quote: source.quote?.trim(),
    };
  }

  if (source.type === "url") {
    return {
      source_type: sourceType,
      source: normalizeSourceUrl(source.url),
    };
  }

  const sourceValue = source.label?.trim() || source.name?.trim();
  return {
    source_type: sourceType,
    source: sourceValue,
    name: sourceValue,
  };
}
