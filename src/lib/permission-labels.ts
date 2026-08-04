import { PERMISSIONS } from "@/router/permissions";

/** Domain groups matching backend permission catalog order. */
export const PERMISSION_GROUPS = [
  "articles",
  "categories",
  "sources",
  "smart-editor",
  "editorial-tools",
  "voice-tools",
  "image-tools",
  "standalone-tools",
  "library",
  "calendar",
  "users",
  "admin",
  "other",
] as const;

export type PermissionGroupKey = (typeof PERMISSION_GROUPS)[number];

const GROUP_LABELS: Record<PermissionGroupKey, string> = {
  articles: "المقالات",
  categories: "التصنيفات",
  sources: "المصادر",
  "smart-editor": "المحرر الذكي",
  "editorial-tools": "أدوات التحرير",
  "voice-tools": "أدوات الصوت",
  "image-tools": "أدوات الصور",
  "standalone-tools": "أدوات مستقلة",
  library: "المكتبة",
  calendar: "التقويم",
  users: "إدارة المستخدمين",
  admin: "الإدارة",
  other: "أخرى",
};

const GROUP_ACCENTS: Record<PermissionGroupKey, string> = {
  articles: "#f98c34",
  categories: "#3b82f6",
  sources: "#06b6d4",
  "smart-editor": "#8b5cf6",
  "editorial-tools": "#ec4899",
  "voice-tools": "#14b8a6",
  "image-tools": "#eab308",
  "standalone-tools": "#64748b",
  library: "#22c55e",
  calendar: "#f59e0b",
  users: "#6366f1",
  admin: "#ef4444",
  other: "#94a3b8",
};

const PERMISSION_TO_GROUP: Record<string, PermissionGroupKey> = {
  [PERMISSIONS.VIEW_ARTICLES]: "articles",
  [PERMISSIONS.CREATE_ARTICLES]: "articles",
  [PERMISSIONS.EDIT_ARTICLES]: "articles",
  [PERMISSIONS.DELETE_ARTICLES]: "articles",
  [PERMISSIONS.PUBLISH_ARTICLES]: "articles",
  [PERMISSIONS.SCHEDULE_ARTICLES]: "articles",
  [PERMISSIONS.REVERT_ARTICLES]: "articles",
  [PERMISSIONS.MANAGE_ARTICLE_MEDIA]: "articles",

  [PERMISSIONS.VIEW_CATEGORIES]: "categories",
  [PERMISSIONS.MANAGE_CATEGORIES]: "categories",

  [PERMISSIONS.VIEW_SOURCES]: "sources",
  [PERMISSIONS.MANAGE_SOURCES]: "sources",

  [PERMISSIONS.RUN_FUSHA_REWRITER]: "smart-editor",
  [PERMISSIONS.RUN_BIAS_NEUTRALIZER]: "smart-editor",
  [PERMISSIONS.RUN_DISCRIMINATION_REMOVER]: "smart-editor",
  [PERMISSIONS.RUN_BULLET_POINTS]: "smart-editor",

  [PERMISSIONS.RUN_STANDARDS_CHECK]: "editorial-tools",
  [PERMISSIONS.RUN_CREDIBILITY_CHECK]: "editorial-tools",
  [PERMISSIONS.RUN_LOCALIZATION]: "editorial-tools",

  [PERMISSIONS.RUN_VOICE_TO_TEXT]: "voice-tools",
  [PERMISSIONS.RUN_TEXT_TO_VOICE]: "voice-tools",

  [PERMISSIONS.RUN_REVERSE_IMAGE_SEARCH]: "image-tools",
  [PERMISSIONS.RUN_AI_IMAGE_DETECTION]: "image-tools",

  [PERMISSIONS.ACCESS_TOOLS]: "standalone-tools",
  [PERMISSIONS.CHECK_DOMAINS]: "standalone-tools",

  [PERMISSIONS.VIEW_LIBRARY]: "library",
  [PERMISSIONS.UPLOAD_LIBRARY]: "library",
  [PERMISSIONS.EDIT_LIBRARY]: "library",
  [PERMISSIONS.DELETE_LIBRARY]: "library",

  [PERMISSIONS.VIEW_TASKS]: "calendar",
  [PERMISSIONS.MANAGE_TASKS]: "calendar",
  [PERMISSIONS.COMPLETE_OWN_TASKS]: "calendar",
  [PERMISSIONS.VIEW_EVENTS]: "calendar",
  [PERMISSIONS.MANAGE_EVENTS]: "calendar",
  [PERMISSIONS.VIEW_ALL_CALENDAR]: "calendar",
  [PERMISSIONS.VIEW_CALENDAR]: "calendar",
  [PERMISSIONS.MANAGE_CALENDAR]: "calendar",

  [PERMISSIONS.VIEW_USERS]: "users",
  [PERMISSIONS.CREATE_USERS]: "users",
  [PERMISSIONS.EDIT_USERS]: "users",
  [PERMISSIONS.DELETE_USERS]: "users",
  [PERMISSIONS.MANAGE_ROLES]: "users",

  [PERMISSIONS.MANAGE_SITE_SETTINGS]: "admin",
  [PERMISSIONS.VIEW_ADMIN_DASHBOARD]: "admin",
};

const PERMISSION_LABELS: Record<string, string> = {
  [PERMISSIONS.VIEW_ARTICLES]: "عرض المقالات",
  [PERMISSIONS.CREATE_ARTICLES]: "إنشاء مقالات",
  [PERMISSIONS.EDIT_ARTICLES]: "تعديل المقالات",
  [PERMISSIONS.DELETE_ARTICLES]: "حذف المقالات",
  [PERMISSIONS.PUBLISH_ARTICLES]: "نشر المقالات",
  [PERMISSIONS.SCHEDULE_ARTICLES]: "جدولة المقالات",
  [PERMISSIONS.REVERT_ARTICLES]: "إرجاع المقالات",
  [PERMISSIONS.MANAGE_ARTICLE_MEDIA]: "إدارة وسائط المقالات",

  [PERMISSIONS.VIEW_CATEGORIES]: "عرض التصنيفات",
  [PERMISSIONS.MANAGE_CATEGORIES]: "إدارة التصنيفات",

  [PERMISSIONS.VIEW_SOURCES]: "عرض المصادر",
  [PERMISSIONS.MANAGE_SOURCES]: "إدارة المصادر",

  [PERMISSIONS.RUN_FUSHA_REWRITER]: "إعادة صياغة فصحى",
  [PERMISSIONS.RUN_BIAS_NEUTRALIZER]: "تحييد التحيز",
  [PERMISSIONS.RUN_DISCRIMINATION_REMOVER]: "إزالة التمييز",
  [PERMISSIONS.RUN_BULLET_POINTS]: "تلخيص نقطي",

  [PERMISSIONS.RUN_STANDARDS_CHECK]: "فحص المعايير",
  [PERMISSIONS.RUN_CREDIBILITY_CHECK]: "فحص المصداقية",
  [PERMISSIONS.RUN_LOCALIZATION]: "متعدد لهجات",

  [PERMISSIONS.RUN_VOICE_TO_TEXT]: "صوت إلى نص",
  [PERMISSIONS.RUN_TEXT_TO_VOICE]: "نص إلى صوت",

  [PERMISSIONS.RUN_REVERSE_IMAGE_SEARCH]: "بحث عكسي للصور",
  [PERMISSIONS.RUN_AI_IMAGE_DETECTION]: "كشف الصور بالذكاء الاصطناعي",

  [PERMISSIONS.ACCESS_TOOLS]: "الوصول للأدوات",
  [PERMISSIONS.CHECK_DOMAINS]: "فحص النطاقات",

  [PERMISSIONS.VIEW_LIBRARY]: "عرض المكتبة",
  [PERMISSIONS.UPLOAD_LIBRARY]: "رفع للمكتبة",
  [PERMISSIONS.EDIT_LIBRARY]: "تعديل المكتبة",
  [PERMISSIONS.DELETE_LIBRARY]: "حذف من المكتبة",

  [PERMISSIONS.VIEW_TASKS]: "عرض المهام",
  [PERMISSIONS.MANAGE_TASKS]: "إدارة المهام",
  [PERMISSIONS.COMPLETE_OWN_TASKS]: "إكمال المهام الشخصية",
  [PERMISSIONS.VIEW_EVENTS]: "عرض الفعاليات",
  [PERMISSIONS.MANAGE_EVENTS]: "إدارة الفعاليات",
  [PERMISSIONS.VIEW_ALL_CALENDAR]: "عرض تقويم الفريق",
  [PERMISSIONS.VIEW_CALENDAR]: "عرض التقويم",
  [PERMISSIONS.MANAGE_CALENDAR]: "إدارة التقويم",

  [PERMISSIONS.VIEW_USERS]: "عرض المستخدمين",
  [PERMISSIONS.CREATE_USERS]: "إنشاء مستخدمين",
  [PERMISSIONS.EDIT_USERS]: "تعديل المستخدمين",
  [PERMISSIONS.DELETE_USERS]: "حذف المستخدمين",
  [PERMISSIONS.MANAGE_ROLES]: "إدارة الأدوار",

  [PERMISSIONS.MANAGE_SITE_SETTINGS]: "إعدادات الموقع",
  [PERMISSIONS.VIEW_ADMIN_DASHBOARD]: "لوحة الإدارة",
};

function inferGroup(slug: string): PermissionGroupKey {
  if (PERMISSION_TO_GROUP[slug]) return PERMISSION_TO_GROUP[slug];
  if (slug.includes("article")) return "articles";
  if (slug.includes("categor")) return "categories";
  if (slug.includes("source")) return "sources";
  if (
    slug.includes("fusha") ||
    slug.includes("bias") ||
    slug.includes("discrimination") ||
    slug.includes("bullet")
  ) {
    return "smart-editor";
  }
  if (
    slug.includes("standards") ||
    slug.includes("credibility") ||
    slug.includes("localization")
  ) {
    return "editorial-tools";
  }
  if (slug.includes("voice") || slug.includes("text-to-voice")) {
    return "voice-tools";
  }
  if (slug.includes("image") || slug.includes("reverse")) return "image-tools";
  if (slug.includes("domain") || slug === "access-tools") {
    return "standalone-tools";
  }
  if (slug.includes("library")) return "library";
  if (
    slug.includes("task") ||
    slug.includes("event") ||
    slug.includes("calendar")
  ) {
    return "calendar";
  }
  if (slug.includes("user") || slug.includes("role")) return "users";
  if (slug.includes("admin") || slug.includes("site-settings")) return "admin";
  return "other";
}

export function permissionGroup(slug: string): PermissionGroupKey {
  return inferGroup(slug);
}

export function permissionGroupLabel(groupKey: string): string {
  return GROUP_LABELS[groupKey as PermissionGroupKey] ?? groupKey;
}

export function permissionGroupAccent(groupKey: string): string {
  return GROUP_ACCENTS[groupKey as PermissionGroupKey] ?? GROUP_ACCENTS.other;
}

export function permissionLabel(slug: string): string {
  return PERMISSION_LABELS[slug] ?? slug.replace(/-/g, " ");
}

export function groupPermissions(slugs: string[]): Map<string, string[]> {
  const map = new Map<string, string[]>();

  for (const key of PERMISSION_GROUPS) {
    map.set(key, []);
  }

  for (const slug of slugs) {
    const group = permissionGroup(slug);
    const list = map.get(group) ?? [];
    list.push(slug);
    map.set(group, list);
  }

  for (const [key, list] of [...map.entries()]) {
    if (list.length === 0) map.delete(key);
  }

  return map;
}
