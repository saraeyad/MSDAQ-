export type ArticleLanguage = "fusha" | "simple" | "dialect";

export type SourceVerificationStatus = "verified" | "under_review" | "unverified";

export type ArticleSource = {
  id: number;
  label: string;
  url?: string;
  type: "url" | "document" | "person" | "anonymous";
  sourceCategory?: string;
  verificationStatus?: SourceVerificationStatus;
  reliability?: number;
};

export type ArticleTimelineEvent = {
  id: number;
  date: string;
  label: string;
};

export type ScoreHistoryEntry = {
  id: number;
  date: string;
  trustScore: number;
  credibilityScore?: number;
  note: string;
  description?: string;
  statusLabel?: string;
};

export type CredibilityBreakdown = {
  sourceAccuracy: number;
  reportNeutrality: number;
  dataVerification: number;
};

export type QuickVerificationItem = {
  id: number;
  text: string;
  status: "verified" | "warning";
};

export type RelatedArticle = {
  id: number;
  title: string;
  credibilityLevel: "high" | "medium" | "low";
};

export type ArticleTag = {
  id: number;
  name: string;
};

export type Article = {
  id: number;
  title: string;
  author: string;
  authorAvatar?: string;
  publishedAt: string;
  readingTimeMinutes?: number;
  trustScore: number | null;
  credibilityScore: number | null;
  originalUrl?: string;
  tags?: ArticleTag[];
  content: Record<ArticleLanguage, string>;
  lead?: Record<ArticleLanguage, string>;
  bodyParagraphs?: Record<ArticleLanguage, string[]>;
  quote?: Record<ArticleLanguage, string>;
  featuredImage?: string;
  featuredImageCaption?: string;
  credibilityBreakdown?: CredibilityBreakdown;
  quickVerification?: QuickVerificationItem[];
  relatedArticles?: RelatedArticle[];
  sources: ArticleSource[];
  timeline: ArticleTimelineEvent[];
  scoreHistory: ScoreHistoryEntry[];
};
