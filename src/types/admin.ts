import type {
  ArticleStatus,
  PublicMediaType,
} from "./articles";

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
