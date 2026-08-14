/** Staff write + public read (03 · Publishing Flow / 02 · Public) */
export type PublicMediaType = "text" | "audio" | "video";
export type StaffMediaType = PublicMediaType;
export type VideoStatus = "processing" | "ready" | "failed" | null;
export type ArticleStatus = "draft" | "scheduled" | "published" | "reverted";
export type ConsentStatus = "pending" | "approved" | "rejected";
export type SourceType = "url" | "document" | "person" | "anonymous";

export interface ArticleContent {
  formal: string | null;
  simplified: string | null;
  dialect: string | null;
}

export interface ArticleGate {
  trust_score: number | null;
  fusha_passed: boolean | null;
  credibility_score: number | null;
  standards_checked_at: string | null;
  credibility_checked_at: string | null;
}

export interface ArticleImage {
  id: number;
  thumb: string;
  full: string;
}

export interface ArticleSource {
  id: number;
  article_id: number;
  source_type: SourceType;
  source: string;
  is_verified: boolean;
  verified_at: string | null;
  consent_status?: ConsentStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateSourcePayload {
  type: SourceType;
  label?: string;
  url?: string;
  name?: string;
  phone?: string;
  email?: string;
  quote?: string;
}

export interface PublicArticleCategory {
  id: number;
  slug: string;
  name_ar: string;
  name_en?: string;
}

export interface StaffArticle {
  id: number;
  title: string;
  description: string | null;
  media_type: StaffMediaType;
  status: ArticleStatus;
  content: ArticleContent;
  gate: ArticleGate;
  scheduled_for: string | null;
  published_at: string | null;
  revert_reason: string | null;
  author: { id: number; name: string };
  category: PublicArticleCategory;
  sources: ArticleSource[];
  cover_image: string | null;
  images: ArticleImage[];
  source_audio: string | null;
  generated_audio: string | null;
  media_url: string | null;
  video: string | null;
  video_poster: string | null;
  video_status: VideoStatus;
  created_at: string;
  updated_at: string;
}

export interface SeoBreadcrumb {
  name: string;
  url: string | null;
}

export interface ArticleSeo {
  article_section: string;
  breadcrumbs: SeoBreadcrumb[];
}

export interface CategorySeo {
  meta_title: string;
  meta_description: string;
  canonical: string;
  og_type: string;
  breadcrumbs: SeoBreadcrumb[];
}

export interface PublicPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PublicCategory {
  id: number;
  slug: string;
  name_ar: string;
  name_en: string;
  description?: string | null;
  /** Example responses use this field name. */
  articles_count: number;
  /** Collection docs name for nav count badges. */
  published_articles_count?: number;
  seo?: CategorySeo;
  children: PublicCategory[];
}

export interface PublicCategoryDetail {
  category: PublicCategory;
  articles: PublicArticle[];
  pagination?: PublicPagination;
}

/** Staff category resource (05 · Categories) */
export interface Category {
  id: number;
  slug: string;
  name_ar: string;
  name_en: string;
  description: string | null;
  parent_id: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children: Category[];
}

export interface CreateCategoryPayload {
  name_ar: string;
  name_en: string;
  description?: string | null;
  parent_id?: number;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateCategoryPayload {
  name_ar?: string;
  name_en?: string;
  description?: string | null;
  parent_id?: number | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface PublicArticlesListResult {
  items: PublicArticle[];
  pagination?: PublicPagination;
}

export interface StaffArticlesListParams {
  status?: ArticleStatus;
  category?: number;
  mine?: boolean;
  page?: number;
}

export interface StaffArticlesListResult {
  items: StaffArticle[];
  pagination?: PublicPagination;
}

export interface PublicArticle {
  id: number;
  title: string;
  description: string | null;
  media_type: PublicMediaType;
  media_url?: string | null;
  content: ArticleContent;
  author?: { id: number; name: string };
  category?: PublicArticleCategory;
  cover_image: string | null;
  images: ArticleImage[];
  sources?: ArticleSource[];
  source_audio?: string | null;
  generated_audio?: string | null;
  video?: string | null;
  video_poster?: string | null;
  published_at: string;
  seo?: ArticleSeo;
}

export interface PublishGateCheck {
  label: string;
  passed: boolean;
  blocking: boolean;
}

export interface DerivedPublishGate {
  media_type: StaffMediaType;
  checks: PublishGateCheck[];
  credibility_score: number | null;
  can_publish: boolean;
}
