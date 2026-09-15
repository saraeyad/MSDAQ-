import type { Locale } from "@/lib/i18n/types";

type CategoryNames = {
  name_ar: string;
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
  }
  return category.name_ar?.trim() ?? category.name_en?.trim() ?? "";
}
