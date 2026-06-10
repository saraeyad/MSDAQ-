export type JournalistArticleStatus =
  | "draft"
  | "pending"
  | "published"
  | "rejected";

export type ArticleSourceType =
  | "url"
  | "document"
  | "person"
  | "anonymous"
  | "organization"
  | "public_figure";

export type SourceConsentStatus = "pending" | "approved" | "rejected";

export type JournalistArticleSource = {
  id: number;
  label: string;
  type: ArticleSourceType;
  url?: string;
  sourceType?: string;
  isVerified?: boolean;
  verifiedAt?: string;
  consent?: {
    name: string;
    status: SourceConsentStatus;
    consent_approved_at?: string | null;
  };
  name?: string;
  email?: string;
  phone?: string;
  quote?: string;
  isLocal?: boolean;
};

export type JournalistArticle = {
  id: number;
  title: string;
  content: string;
  status: JournalistArticleStatus;
  coverImage?: string;
  /** Raw cover_image path from API before URL resolution */
  coverImageRaw?: string | null;
  trustScore: number | null;
  credibilityScore: number | null;
  fushaPassed?: boolean | null;
  standardsBreakdown?: Record<
    string,
    | { passed: boolean; feedback: string }
    | { score: number; feedback: string }
  > | null;
  isPublishable?: boolean;
  rejectionReason?: string;
  sources: JournalistArticleSource[];
  /** True when GET response included a sources array (may be empty) */
  sourcesLoadedFromApi?: boolean;
  journalist?: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  publishedAt?: string;
};

export type StandardsBreakdownItem = {
  key: string;
  label: string;
  passed?: boolean;
  score?: number;
  feedback: string;
};

export type StandardsCheckResult = {
  trustScore: number;
  credibilityScore: number | null;
  fushaCompliant: boolean;
  dialectDetected: boolean;
  canPublish: boolean;
  breakdown: StandardsBreakdownItem[];
  issues: string[];
};

export type PublishGate = "fusha" | "trustScore" | "hasSource" | "humanConsent";

export type PublishGateStatus = {
  passed: boolean;
  /** When set, checklist uses this instead of `passed` for display only. */
  displayPassed?: boolean;
  detail?: string;
  pendingCount?: number;
  rejectedCount?: number;
  currentScore?: number | null;
};

export type PublishReadiness = {
  canPublish: boolean;
  gates: Record<PublishGate, PublishGateStatus>;
};
