import { findCategoryByFilterKey } from "@/lib/publishing";
import type { PublicArticle, PublicCategory } from "@/types";

/** Rail (2) + promo row (5) under the lead, BBC-style front grid. */
export const HOME_FRONT_RAIL_SIZE = 2;
export const HOME_FRONT_PROMO_SIZE = 5;
export const HOME_FRONT_STACK_SIZE = HOME_FRONT_RAIL_SIZE + HOME_FRONT_PROMO_SIZE;

export type HomeFeedDeskLayout = "grid" | "wide" | "audio" | "video";

export type HomeFrontPack = {
  lead: PublicArticle | null;
  stack: PublicArticle[];
};

function foldArabic(value: string): string {
  return value
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآا]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}

function categoryNamesBlob(category: PublicCategory | undefined): string {
  if (!category) return "";
  return [category.name_ar, category.name_en]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" ");
}

function foldedCategoryNames(category: PublicCategory | undefined): string {
  return foldArabic(categoryNamesBlob(category));
}

function photoReportsNameMatch(names: string, slugLower: string): boolean {
  if (names.includes("قصص") && names.includes("مصوره")) return false;
  if (names.includes("تقارير") && names.includes("مصور")) return true;
  if (names.includes("تقرير") && names.includes("مصور")) return true;
  return (
    slugLower.includes("photo-report") ||
    slugLower.includes("visual-report") ||
    slugLower.includes("photo_reports") ||
    slugLower.includes("taqarir") ||
    slugLower.includes("taqrir-musaw")
  );
}

function isPhotoReportsCategoryBand(
  slug: string,
  categories: PublicCategory[],
): boolean {
  const category =
    findCategoryByFilterKey(categories, slug) ??
    categories.find((item) => item.slug === slug);
  const names = foldedCategoryNames(category);
  const nameEn = category?.name_en?.trim().toLowerCase() ?? "";
  const slugLower = slug.toLowerCase();
  if (nameEn.includes("photo report") || nameEn.includes("visual report")) {
    return true;
  }
  return photoReportsNameMatch(names, slugLower);
}

function isVideoCategoryBand(
  slug: string,
  categories: PublicCategory[],
): boolean {
  if (isAudioCategoryBand(slug, categories)) return false;
  const category = findCategoryByFilterKey(categories, slug);
  const nameAr = category?.name_ar?.trim() ?? "";
  const nameEn = category?.name_en?.trim().toLowerCase() ?? "";
  const slugLower = slug.toLowerCase();

  if (nameAr === "فيديو" || nameAr.includes("فيديو")) return true;
  if (nameEn === "video" || nameEn.includes("video")) return true;
  return slugLower === "video" || slugLower.includes("video");
}

function isAudioCategoryBand(
  slug: string,
  categories: PublicCategory[],
): boolean {
  const category = findCategoryByFilterKey(categories, slug);
  const names = categoryNamesBlob(category);
  const nameAr = category?.name_ar?.trim() ?? "";
  const nameEn = category?.name_en?.trim().toLowerCase() ?? "";
  const slugLower = slug.toLowerCase();

  if (names.includes("تقارير مسموعة") || names.includes("مسموعة")) return true;
  if (names.includes("بودكاست") || nameAr.includes("بودكاست")) return true;
  if (nameAr.includes("مسموعة") || nameAr.includes("مسموع")) return true;
  if (
    nameEn.includes("audio report") ||
    nameEn.includes("podcast") ||
    nameEn.includes("listen")
  ) {
    return true;
  }
  return (
    slugLower.includes("audio") ||
    slugLower.includes("podcast") ||
    slugLower.includes("masmu") ||
    slugLower.includes("masmo")
  );
}

export function getDeskLayout(
  slug: string,
  categories: PublicCategory[],
): HomeFeedDeskLayout {
  if (isPhotoReportsCategoryBand(slug, categories)) {
    return "wide";
  }
  if (isAudioCategoryBand(slug, categories)) return "audio";
  if (isVideoCategoryBand(slug, categories)) return "video";
  return "grid";
}

export function splitFrontPack(articles: PublicArticle[]): HomeFrontPack {
  if (articles.length === 0) {
    return { lead: null, stack: [] };
  }
  return {
    lead: articles[0] ?? null,
    stack: articles.slice(1, 1 + HOME_FRONT_STACK_SIZE),
  };
}

/** Split stack into a headline rail and a 4-up photo row. */
export function partitionFrontStack(stack: PublicArticle[]): {
  rail: PublicArticle[];
  promos: PublicArticle[];
} {
  return {
    rail: stack.slice(0, HOME_FRONT_RAIL_SIZE),
    promos: stack.slice(
      HOME_FRONT_RAIL_SIZE,
      HOME_FRONT_RAIL_SIZE + HOME_FRONT_PROMO_SIZE,
    ),
  };
}

export function frontPackArticleIds(pack: HomeFrontPack): Set<string> {
  const ids = new Set<string>();
  if (pack.lead) ids.add(String(pack.lead.id));
  for (const article of pack.stack) {
    ids.add(String(article.id));
  }
  return ids;
}
