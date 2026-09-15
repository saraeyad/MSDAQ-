import type { Locale } from "@/lib/i18n/types";

type CategoryNames = {
  name?: string | null;
  name_ar?: string | null;
  name_en?: string | null;
};

export function localizedCategoryName(
  category: CategoryNames | null | undefined,
  locale: Locale,
): string {
  if (!category) return "";
  if (locale === "en") {
    const en = category.name_en?.trim();
    if (en) return en;
  } else {
    const ar = category.name_ar?.trim();
    if (ar) return ar;
  }
  return (
    category.name?.trim() ||
    category.name_ar?.trim() ||
    category.name_en?.trim() ||
    ""
  );
}
