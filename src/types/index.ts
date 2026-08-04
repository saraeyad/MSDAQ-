export interface ApiResponse<T> {
  /** Collection envelope — preferred */
  success?: boolean;
  /** Legacy envelope still returned by some deployments */
  error?: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
  /** Paginated public articles list — sibling of `data` on live API */
  meta?: PublicPagination;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

/** Staff write + public read (03 · Publishing Flow / 02 · Public) */
export type PublicMediaType = "text" | "audio" | "video";
export type StaffMediaType = PublicMediaType;
/** @deprecated Use StaffMediaType */
export type MediaType = StaffMediaType;
export type VideoStatus = "processing" | "ready" | "failed" | null;
export type ArticleStatus = "draft" | "scheduled" | "published" | "reverted";
export type ConsentStatus = "pending" | "approved" | "rejected";
export type SourceType = "url" | "document" | "person" | "anonymous";

export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  created_at: string;
}

export interface AdminUsersListParams {
  role?: string;
  search?: string;
  page?: number;
}

export interface CreateAdminUserPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
}

export interface UpdateAdminUserPayload {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: string[];
  is_protected: boolean;
  users_count: number;
}

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

export interface PublicArticleCategory {
  id: number;
  slug: string;
  name_ar: string;
  name_en?: string;
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
  description?: string;
  articles_count: number;
  seo?: CategorySeo;
}

export interface PublicCategoryDetail {
  category: PublicCategory;
  articles: PublicArticle[];
  pagination: PublicPagination;
}

/** Staff category resource (05 · Categories) */
export interface Category {
  id: number;
  slug: string;
  name_ar: string;
  name_en: string;
  sort_order: number;
  is_active: boolean;
}

export interface CreateCategoryPayload {
  name_ar: string;
  name_en: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateCategoryPayload {
  name_ar?: string;
  name_en?: string;
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

export type CalendarRecurrence = "none" | "daily" | "weekly" | "monthly";
export type CalendarItemType = "task" | "event" | "article";
export type TaskPriority = "low" | "medium" | "high";
export type TaskOccurrenceStatus = "pending" | "done";

export interface TaskFeedMeta {
  priority: TaskPriority;
  status: TaskOccurrenceStatus;
  assignees: Pick<User, "id" | "name">[];
}

export interface EventFeedMeta {
  participants: Pick<User, "id" | "name">[];
}

export interface ArticleFeedMeta {
  media_type: StaffMediaType;
  author: string;
  category: { slug: string; name_ar: string };
}

export interface CalendarFeedItem {
  type: CalendarItemType;
  id: string;
  source_id: number;
  title: string;
  start_at: string;
  end_at: string | null;
  color: string | null;
  meta: TaskFeedMeta | EventFeedMeta | ArticleFeedMeta;
}

export interface CalendarTask {
  id: number;
  title: string;
  description?: string | null;
  due_at: string;
  priority: TaskPriority;
  color?: string | null;
  recurrence?: CalendarRecurrence;
  recurrence_end_at?: string | null;
  creator: Pick<User, "id" | "name">;
  assignees: Pick<User, "id" | "name">[];
  created_at: string;
}

export interface CreateCalendarTaskPayload {
  title: string;
  description?: string;
  due_at: string;
  priority?: TaskPriority;
  color?: string;
  recurrence?: CalendarRecurrence;
  recurrence_end_at?: string;
  assignees?: number[];
}

export interface UpdateCalendarTaskPayload
  extends Partial<CreateCalendarTaskPayload> {}

export interface CalendarEventRecord {
  id: number;
  title: string;
  description?: string | null;
  color?: string | null;
  starts_at: string;
  ends_at?: string | null;
  recurrence?: CalendarRecurrence;
  recurrence_end_at?: string | null;
  creator: Pick<User, "id" | "name">;
  participants: Pick<User, "id" | "name">[];
  created_at?: string;
}

export interface CreateCalendarEventRecordPayload {
  title: string;
  description?: string;
  starts_at: string;
  ends_at?: string;
  color?: string;
  recurrence?: CalendarRecurrence;
  recurrence_end_at?: string;
  participants?: number[];
}

export interface UpdateCalendarEventRecordPayload
  extends Partial<CreateCalendarEventRecordPayload> {}

export interface UserPickerItem {
  id: number;
  name: string;
}

export interface TaskOccurrencePayload {
  occurrence_date: string;
}

export type LibraryFileType =
  | "image"
  | "video"
  | "audio"
  | "pdf"
  | "document"
  | "spreadsheet"
  | "other";

export interface LibraryItem {
  id: number;
  title: string;
  description?: string | null;
  category?: string | null;
  file_url?: string | null;
  file_type: LibraryFileType | string;
  uploaded_by?: Pick<User, "id" | "name"> | null;
  created_at: string;
}

export interface UpdateLibraryItemPayload {
  title?: string;
  description?: string;
  category?: string;
}

export interface LibraryListParams {
  category?: string;
  file_type?: LibraryFileType;
  search?: string;
  page?: number;
}

export interface SiteSettings {
  about: string;
  who_we_are: string;
  contact: string;
  site_policy: string;
  terms: string;
  contact_email: string;
  tip_line: string;
  credibility_threshold: number;
}

export interface AdminDashboardOverview {
  articles_total: number;
  published: number;
  drafts: number;
  scheduled: number;
  reverted: number;
  users_total: number;
  categories_total: number;
  pending_consents: number;
}

export interface AdminDashboardCategoryCount {
  slug: string;
  name_ar: string;
  name_en: string;
  count: number;
}

export interface AdminDashboardPublishingTrendPoint {
  date: string;
  count: number;
}

export interface AdminDashboardArticles {
  by_status: Record<ArticleStatus, number>;
  by_media_type: Record<PublicMediaType, number>;
  by_category: AdminDashboardCategoryCount[];
  publishing_trend: AdminDashboardPublishingTrendPoint[];
  quality: {
    avg_trust_score: number | null;
    avg_credibility_score: number | null;
  };
}

export interface AdminDashboardScheduledItem {
  id: number;
  title: string;
  scheduled_for: string;
  author: string;
}

export interface AdminDashboardRevertedItem {
  id: number;
  title: string;
  revert_reason: string;
  author: string;
  updated_at: string;
}

export interface AdminDashboardPendingConsentItem {
  id: number;
  title: string;
  author: string;
}

export interface AdminDashboardWorkflow {
  scheduled_queue: AdminDashboardScheduledItem[];
  reverted: AdminDashboardRevertedItem[];
  pending_consents: AdminDashboardPendingConsentItem[];
}

export interface AdminDashboardTopAuthor {
  id: number;
  name: string;
  count: number;
}

export interface AdminDashboardPeople {
  by_role: Record<string, number>;
  top_authors: AdminDashboardTopAuthor[];
}

export interface AdminDashboardRecentArticle {
  id: number;
  title: string;
  media_type: PublicMediaType;
  author: string;
  category: { slug: string; name_ar: string };
  published_at: string;
}

export interface AdminDashboard {
  overview: AdminDashboardOverview;
  articles: AdminDashboardArticles;
  workflow: AdminDashboardWorkflow;
  people: AdminDashboardPeople;
  recent: AdminDashboardRecentArticle[];
}

export interface StandardsCriterion {
  key: string;
  label: string;
  score: number | null;
  passed: boolean | null;
  max: number | null;
  feedback: string;
}

export interface StandardsCheckResult {
  fusha_passed: boolean;
  total_score: number;
  max_score: number;
  criteria: StandardsCriterion[];
}

export interface CredibilityClaim {
  text: string;
  verdict: "verified" | "unverified" | "false" | "disputed" | string;
  explanation: string;
}

export interface CredibilityCheckResult {
  credibility_score: number;
  total_claims: number;
  claims: CredibilityClaim[];
}

export interface LocalizationResult {
  simplified: string;
  dialect: string;
}

export interface StandaloneStandardsBreakdown {
  key?: string;
  label?: string;
  score?: number | null;
  passed?: boolean | null;
  feedback?: string;
}

export interface StandaloneStandardsResult {
  total_score: number;
  fusha_passed: boolean;
  breakdown: StandaloneStandardsBreakdown[];
}

export interface StandaloneCredibilityResult {
  credibility_score: number;
}

export interface StandaloneLocalizationResult {
  content_simplified: string;
  content_dialect: string;
}

export interface GeneratedAudio {
  id: number;
  name: string | null;
  audio_url: string;
  voice: string;
  style: string | null;
  is_saved: boolean;
  saved_at: string | null;
  saved_by?: string | null;
  user_id?: number | null;
  created_by?: Pick<User, "id" | "name"> | null;
  created_at: string;
}

export interface Transcript {
  id: number;
  article_id: number | null;
  name: string | null;
  original_filename: string;
  file_size: number;
  status: "processing" | "completed" | "failed";
  transcript: string | null;
  is_saved: boolean;
  saved_at: string | null;
  saved_by?: string | null;
  user_id?: number | null;
  created_by?: Pick<User, "id" | "name"> | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedListResult<T> {
  items: T[];
  pagination?: PublicPagination;
}

export interface AppNotification {
  id: string;
  type: string;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface UnreadNotificationsCount {
  count: number;
}

export interface SmartEditorResult {
  suggestion?: string;
  bullets?: string[];
}

export interface ReverseSearchMatch {
  title: string;
  link: string;
  domain: string;
  logo?: string;
  image?: string | null;
  date?: string | null;
}

export interface AiDetectionResult {
  likely_ai_generated: boolean;
  confidence_score: number;
  status: string;
  verdict: "ai_generated" | "likely_real" | "uncertain" | string;
}

export interface TtsVoice {
  name: string;
  description: string;
  style: string;
}

export interface TtsResult {
  article_id: number;
  audio_url: string;
}

export interface VideoUploadResult {
  video_status: Exclude<VideoStatus, null>;
  message?: string;
}

export interface TranscriptJob {
  id: number;
  article_id: number | null;
  original_filename: string;
  file_size: number;
  status: "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
}

export interface DomainCheckResult {
  domain: string;
  is_available: boolean;
  registered_at?: string | null;
  expires_at?: string | null;
  updated_at?: string | null;
  registrar?: string | null;
  name_servers?: string[];
}
