import { resolveApiMediaUrl } from "@/lib/media-url";
import type {
  Article,
  ArticleLanguage,
  ArticleSource,
  CredibilityBreakdown,
} from "@/types/article";
import type { ApiResponse } from "./api";

export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type PaginatedApiResponse<T> = ApiResponse<T> & {
  meta?: PaginationMeta;
};

export type ApiArticleJournalist = {
  id: number;
  name: string;
};

export type ApiArticleTag = {
  id: number;
  name: string;
};

export type ApiArticleSource = {
  id: number;
  label?: string | null;
  name?: string | null;
  url?: string | null;
  type?: string | null;
  verification_status?: string | null;
  reliability?: number | null;
  source_category?: string | null;
};

export type ApiCredibilityBreakdown = {
  source_accuracy?: number | null;
  report_neutrality?: number | null;
  data_verification?: number | null;
};

export type ApiArticle = {
  id: number;
  title: string;
  status?: string;
  cover_image?: string | null;
  tags?: ApiArticleTag[] | string[];
  content_formal?: string | null;
  content_fusha?: string | null;
  content_simplified?: string | null;
  content_mubassit?: string | null;
  content_dialect?: string | null;
  content_ammiya?: string | null;
  trust_score?: number | null;
  credibility_score?: number | null;
  fusha_passed?: boolean | null;
  standards_breakdown?: Record<string, unknown> | null;
  credibility_breakdown?: ApiCredibilityBreakdown | Record<string, unknown> | null;
  is_publishable?: boolean | null;
  original_url?: string | null;
  journalist?: ApiArticleJournalist | null;
  sources?: ApiArticleSource[];
  published_at?: string | null;
  created_at?: string | null;
};

export type ArticlesListParams = {
  page?: number;
  search?: string;
};

export type ArticlesListResult = {
  articles: Article[];
  meta: PaginationMeta;
};

export type ArticlesListResponse = PaginatedApiResponse<ApiArticle[]>;
export type ArticleDetailResponse = ApiResponse<ApiArticle>;

const EMPTY_META: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
};

function readFormalContent(article: ApiArticle): string {
  return (
    article.content_formal ??
    article.content_fusha ??
    ""
  ).trim();
}

function readSimplifiedContent(article: ApiArticle): string {
  return (
    article.content_simplified ??
    article.content_mubassit ??
    ""
  ).trim();
}

function readDialectContent(article: ApiArticle): string {
  return (
    article.content_dialect ??
    article.content_ammiya ??
    ""
  ).trim();
}

function splitParagraphs(content: string): string[] {
  if (!content) return [];
  return content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function mapContent(article: ApiArticle): Record<ArticleLanguage, string> {
  return {
    fusha: readFormalContent(article),
    simple: readSimplifiedContent(article),
    dialect: readDialectContent(article),
  };
}

function mapCredibilityBreakdown(
  breakdown: ApiArticle["credibility_breakdown"],
): CredibilityBreakdown | undefined {
  if (!breakdown || typeof breakdown !== "object") return undefined;

  const typed = breakdown as ApiCredibilityBreakdown;
  const sourceAccuracy = typed.source_accuracy;
  const reportNeutrality = typed.report_neutrality;
  const dataVerification = typed.data_verification;

  if (
    sourceAccuracy == null &&
    reportNeutrality == null &&
    dataVerification == null
  ) {
    return undefined;
  }

  return {
    sourceAccuracy: sourceAccuracy ?? 0,
    reportNeutrality: reportNeutrality ?? 0,
    dataVerification: dataVerification ?? 0,
  };
}

function mapTags(tags: ApiArticle["tags"]): Article["tags"] {
  if (!tags?.length) return undefined;
  return tags.map((tag, index) =>
    typeof tag === "string"
      ? { id: index, name: tag }
      : { id: tag.id, name: tag.name },
  );
}

function mapSource(source: ApiArticleSource): ArticleSource {
  const type = (source.type ?? "url") as ArticleSource["type"];
  const verificationStatus = (source.verification_status ??
    "verified") as ArticleSource["verificationStatus"];

  return {
    id: source.id,
    label: source.label ?? source.name ?? "",
    url: source.url ?? undefined,
    type,
    sourceCategory: source.source_category ?? undefined,
    verificationStatus,
    reliability: source.reliability ?? undefined,
  };
}

export function mapApiArticleToArticle(article: ApiArticle): Article {
  const content = mapContent(article);
  const formalContent = content.fusha;
  const paragraphs = splitParagraphs(formalContent);

  return {
    id: article.id,
    title: article.title,
    author: article.journalist?.name ?? "",
    publishedAt: article.published_at ?? article.created_at ?? new Date().toISOString(),
    trustScore: article.trust_score ?? null,
    credibilityScore: article.credibility_score ?? null,
    content,
    lead: formalContent ? { fusha: paragraphs[0] ?? formalContent, simple: content.simple, dialect: content.dialect } : undefined,
    bodyParagraphs: paragraphs.length
      ? { fusha: paragraphs, simple: splitParagraphs(content.simple), dialect: splitParagraphs(content.dialect) }
      : undefined,
    featuredImage: resolveApiMediaUrl(article.cover_image),
    originalUrl: article.original_url ?? undefined,
    tags: mapTags(article.tags),
    credibilityBreakdown: mapCredibilityBreakdown(article.credibility_breakdown),
    sources: (article.sources ?? []).map(mapSource),
    timeline: [],
    scoreHistory: [],
  };
}

export function parseArticlesListResponse(
  response: ArticlesListResponse,
): ArticlesListResult {
  if (response.error) {
    throw new Error(response.message || "Failed to load articles");
  }

  return {
    articles: (response.data ?? []).map(mapApiArticleToArticle),
    meta: response.meta ?? EMPTY_META,
  };
}

export function parseArticleDetailResponse(
  response: ArticleDetailResponse,
): Article {
  if (response.error || !response.data) {
    throw new Error(response.message || "Article not found");
  }

  return mapApiArticleToArticle(response.data);
}

export function getArticleErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const axiosError = error as {
    response?: { status?: number; data?: { message?: string } };
    message?: string;
  };

  if (axiosError.response?.status === 404) {
    return axiosError.response.data?.message || fallback;
  }

  return axiosError.response?.data?.message ?? axiosError.message ?? fallback;
}
