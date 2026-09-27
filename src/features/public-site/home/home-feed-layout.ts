import { findCategoryByFilterKey } from "@/lib/publishing";
import type { PublicArticle, PublicCategory } from "@/types";

export const HOME_DESK_ARTICLE_LIMIT = 3;
export const HOME_AUDIO_DESK_LIMIT = 3;

export type HomeFeedDeskLayout = "grid" | "wide" | "audio" | "video";

export type HomeFrontPack = {
  lead: PublicArticle | null;
  stack: PublicArticle[];
};

export type HomeCategoryDesk = {
  slug: string;
  articles: PublicArticle[];
  layout: HomeFeedDeskLayout;
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

export function findPhotoReportsCategory(
  categories: PublicCategory[],
): PublicCategory | undefined {
  return categories.find((category) => {
    const raw = `${category.name_ar ?? ""} ${category.name_en ?? ""}`;
    if (raw.includes("قصص") && raw.includes("مصور")) return false;
    if (raw.includes("تقارير") && raw.includes("مصور")) return true;
    return photoReportsNameMatch(
      foldedCategoryNames(category),
      category.slug.toLowerCase(),
    );
  });
}

export function isPhotoReportsCategoryBand(
  slug: string,
  categories: PublicCategory[],
): boolean {
  const category = findCategoryByFilterKey(categories, slug) ??
    categories.find((item) => item.slug === slug);
  const names = foldedCategoryNames(category);
  const nameEn = category?.name_en?.trim().toLowerCase() ?? "";
  const slugLower = slug.toLowerCase();
  if (nameEn.includes("photo report") || nameEn.includes("visual report")) {
    return true;
  }
  return photoReportsNameMatch(names, slugLower);
}

export function isVisualStoriesCategoryBand(
  slug: string,
  categories: PublicCategory[],
): boolean {
  const category = findCategoryByFilterKey(categories, slug);
  const names = foldedCategoryNames(category);
  const nameEn = category?.name_en?.trim().toLowerCase() ?? "";
  const slugLower = slug.toLowerCase();

  if (names.includes("قصص مصوره")) return true;
  if (names.includes("قصص") && names.includes("مصوره")) return true;
  if (nameEn.includes("visual stor") || nameEn.includes("photo stor")) {
    return true;
  }
  return (
    slugLower.includes("visual-stor") ||
    slugLower.includes("photo-stor") ||
    slugLower.includes("qasas-musaw") ||
    slugLower.includes("qisas-musaw")
  );
}

export function isVideoCategoryBand(
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

export function isAudioCategoryBand(
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

function deskTier(slug: string, categories: PublicCategory[]): number {
  if (
    isPhotoReportsCategoryBand(slug, categories) ||
    isVisualStoriesCategoryBand(slug, categories)
  ) {
    return 1;
  }
  if (isVideoCategoryBand(slug, categories)) return 2;
  if (isAudioCategoryBand(slug, categories)) return 3;
  return 0;
}

/** Photo / visual desks before video and audio; other categories keep API order. */
export function orderCategoriesForDesks(
  categories: PublicCategory[],
): PublicCategory[] {
  return [...categories]
    .map((cat, index) => ({
      cat,
      index,
      tier: deskTier(cat.slug, categories),
    }))
    .sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      return a.index - b.index;
    })
    .map(({ cat }) => cat);
}

export function isHumanStoriesCategoryBand(
  slug: string,
  categories: PublicCategory[],
): boolean {
  const category = findCategoryByFilterKey(categories, slug);
  const names = foldedCategoryNames(category);
  const slugLower = slug.toLowerCase();
  if (names.includes("قصص انسانيه") || names.includes("قصص انساني")) return true;
  if (names.includes("قصص") && names.includes("انسان")) return true;
  return (
    slugLower.includes("human") ||
    slugLower.includes("insani") ||
    slugLower.includes("insania") ||
    slugLower.includes("humanitarian")
  );
}

export function isSuccessStoriesCategoryBand(
  slug: string,
  categories: PublicCategory[],
): boolean {
  const category = findCategoryByFilterKey(categories, slug);
  const names = categoryNamesBlob(category);
  const nameAr = category?.name_ar?.trim() ?? "";
  const nameEn = category?.name_en?.trim().toLowerCase() ?? "";
  const slugLower = slug.toLowerCase();
  if (names.includes("قصص نجاح") || nameAr.includes("قصص نجاح")) return true;
  if (nameAr === "نجاح" || names.includes("نجاح")) return true;
  return (
    nameEn.includes("success") ||
    slugLower.includes("success") ||
    slugLower.includes("najah")
  );
}

/** How many stories a desk shows so the front stays even. */
export function deskArticleLimit(layout: HomeFeedDeskLayout): number {
  if (layout === "audio") return HOME_AUDIO_DESK_LIMIT;
  return HOME_DESK_ARTICLE_LIMIT;
}

export function isStudiesCategoryBand(
  slug: string,
  categories: PublicCategory[],
): boolean {
  const category = findCategoryByFilterKey(categories, slug);
  const names = categoryNamesBlob(category);
  const nameAr = category?.name_ar?.trim() ?? "";
  const nameEn = category?.name_en?.trim().toLowerCase() ?? "";
  const slugLower = slug.toLowerCase();
  if (names.includes("دراسات") || nameAr.includes("دراسات")) return true;
  return nameEn.includes("stud") || slugLower.includes("stud");
}

export type HomeMosaic = {
  podcasts: PublicArticle[];
  podcastSlug: string | null;
  human: HomeCategoryDesk | null;
  visual: HomeCategoryDesk | null;
  aside: HomeCategoryDesk | null;
  asideSuccessSlug: string | null;
  asideStudiesSlug: string | null;
};

/**
 * After the latest lead + stack:
 * a podcasts band, three human stories,
 * then photo reports beside a success/studies stack.
 */
export function buildHomeMosaic(
  desks: HomeCategoryDesk[],
  categories: PublicCategory[],
): HomeMosaic {
  const audio =
    desks.find((desk) => desk.layout === "audio") ??
    desks.find((desk) => isAudioCategoryBand(desk.slug, categories)) ??
    null;
  const humanDesk =
    desks.find((desk) => isHumanStoriesCategoryBand(desk.slug, categories)) ??
    null;
  const photoReportsCategory = findPhotoReportsCategory(categories);
  const visualDesk =
    desks.find((desk) => desk.slug === photoReportsCategory?.slug) ??
    desks.find((desk) => isPhotoReportsCategoryBand(desk.slug, categories)) ??
    null;
  const visualFallbackDesk =
    desks.find((desk) => isVisualStoriesCategoryBand(desk.slug, categories)) ??
    desks.find((desk) => desk.layout === "video") ??
    null;
  const successDesk =
    desks.find((desk) => isSuccessStoriesCategoryBand(desk.slug, categories)) ??
    null;
  const studiesDesk =
    desks.find((desk) => isStudiesCategoryBand(desk.slug, categories)) ??
    null;

  const podcasts = (audio?.articles ?? []).slice(0, 3);
  const humanArticles = (humanDesk?.articles ?? []).slice(0, 3);
  const visualSeen = new Set<string>();
  const visualArticles: PublicArticle[] = [];
  for (const article of [
    ...(visualDesk?.articles ?? []),
    ...(visualFallbackDesk?.articles ?? []),
  ]) {
    const id = String(article.id);
    if (visualSeen.has(id)) continue;
    visualSeen.add(id);
    visualArticles.push(article);
    if (visualArticles.length >= 3) break;
  }
  const seenAside = new Set<string>();
  const asideArticles: PublicArticle[] = [];
  for (const article of [
    ...(successDesk?.articles ?? []),
    ...(studiesDesk?.articles ?? []),
  ]) {
    const id = String(article.id);
    if (seenAside.has(id)) continue;
    seenAside.add(id);
    asideArticles.push(article);
    if (asideArticles.length >= 6) break;
  }

  return {
    podcasts,
    podcastSlug: audio?.slug ?? null,
    human:
      humanDesk && humanArticles.length > 0
        ? { ...humanDesk, articles: humanArticles, layout: "grid" }
        : null,
    visual:
      visualArticles.length > 0
        ? {
            slug:
              photoReportsCategory?.slug ??
              visualDesk?.slug ??
              visualFallbackDesk?.slug ??
              "",
            articles: visualArticles,
            layout: "grid",
          }
        : null,
    aside:
      asideArticles.length > 0
        ? {
            slug: successDesk?.slug ?? studiesDesk?.slug ?? "",
            articles: asideArticles,
            layout: "grid",
          }
        : null,
    asideSuccessSlug: successDesk?.slug ?? null,
    asideStudiesSlug: studiesDesk?.slug ?? null,
  };
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
    stack: articles.slice(1, 4),
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

export function dedupeDeskArticles(
  articles: PublicArticle[],
  excludeIds: ReadonlySet<string>,
  limit = HOME_DESK_ARTICLE_LIMIT,
): PublicArticle[] {
  const result: PublicArticle[] = [];
  for (const article of articles) {
    if (excludeIds.has(String(article.id))) continue;
    result.push(article);
    if (result.length >= limit) break;
  }
  return result;
}

/** Filter chip: lead + stack from the feed, remainder as one desk. */
export function buildFilteredCategoryDesk(
  articles: PublicArticle[],
  categorySlug: string,
  categories: PublicCategory[],
): HomeCategoryDesk | null {
  const rest = articles.slice(4);
  if (rest.length === 0) return null;
  return {
    slug: categorySlug,
    articles: rest.slice(0, deskArticleLimit(getDeskLayout(categorySlug, categories))),
    layout: getDeskLayout(categorySlug, categories),
  };
}
