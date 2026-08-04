export const SUPER_ADMIN_ROLE = "super-admin";

export const PERMISSIONS = {
  // Articles
  VIEW_ARTICLES: "view-articles",
  CREATE_ARTICLES: "create-articles",
  EDIT_ARTICLES: "edit-articles",
  DELETE_ARTICLES: "delete-articles",
  PUBLISH_ARTICLES: "publish-articles",
  SCHEDULE_ARTICLES: "schedule-articles",
  REVERT_ARTICLES: "revert-articles",
  MANAGE_ARTICLE_MEDIA: "manage-article-media",

  // Categories
  VIEW_CATEGORIES: "view-categories",
  MANAGE_CATEGORIES: "manage-categories",

  // Sources
  VIEW_SOURCES: "view-sources",
  MANAGE_SOURCES: "manage-sources",

  // Smart Editor
  RUN_FUSHA_REWRITER: "run-fusha-rewriter",
  RUN_BIAS_NEUTRALIZER: "run-bias-neutralizer",
  RUN_DISCRIMINATION_REMOVER: "run-discrimination-remover",
  RUN_BULLET_POINTS: "run-bullet-points-summarizer",

  // Editorial tools
  RUN_STANDARDS_CHECK: "run-standards-check",
  RUN_CREDIBILITY_CHECK: "run-credibility-check",
  RUN_LOCALIZATION: "run-localization",

  // Voice tools
  RUN_VOICE_TO_TEXT: "run-voice-to-text",
  RUN_TEXT_TO_VOICE: "run-text-to-voice",

  // Image tools
  RUN_REVERSE_IMAGE_SEARCH: "run-reverse-image-search",
  RUN_AI_IMAGE_DETECTION: "run-ai-image-detection",

  // Standalone tools
  ACCESS_TOOLS: "access-tools",
  CHECK_DOMAINS: "check-domains",

  // Library
  VIEW_LIBRARY: "view-library",
  UPLOAD_LIBRARY: "upload-library",
  EDIT_LIBRARY: "edit-library",
  DELETE_LIBRARY: "delete-library",

  // Calendar
  VIEW_TASKS: "view-tasks",
  MANAGE_TASKS: "manage-tasks",
  COMPLETE_OWN_TASKS: "complete-own-tasks",
  VIEW_EVENTS: "view-events",
  MANAGE_EVENTS: "manage-events",
  VIEW_ALL_CALENDAR: "view-all-calendar",
  /** @deprecated Prefer granular calendar permissions above */
  VIEW_CALENDAR: "view-calendar",
  /** @deprecated Prefer granular calendar permissions above */
  MANAGE_CALENDAR: "manage-calendar",

  // User management
  VIEW_USERS: "view-users",
  CREATE_USERS: "create-users",
  EDIT_USERS: "edit-users",
  DELETE_USERS: "delete-users",
  MANAGE_ROLES: "manage-roles",

  // Admin
  MANAGE_SITE_SETTINGS: "manage-site-settings",
  VIEW_ADMIN_DASHBOARD: "view-admin-dashboard",
} as const;

export type PermissionSlug =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
