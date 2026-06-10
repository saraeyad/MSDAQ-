import { Badge } from "@/components/ui/badge";
import type { DiscussionCategoryStat, DiscussionTag } from "@/types/discussion";
import { Hash } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PopularCategoriesProps {
  categories: DiscussionCategoryStat[];
}

const TAG_ORDER: DiscussionTag[] = ["ethics", "accountability", "personal_story"];

export default function PopularCategories({ categories }: PopularCategoriesProps) {
  const { t } = useTranslation();

  const ordered = TAG_ORDER.map(
    (tag) => categories.find((c) => c.tag === tag) ?? { tag, count: 0 },
  );

  return (
    <div className="discussion-sidebar-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-md border border-border bg-muted/50 text-muted-foreground">
          <Hash className="size-4" />
        </div>
        <h2 className="text-headline-sm">{t("discussion.popularCategories")}</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {ordered.map((category) => (
          <Badge
            key={category.tag}
            variant="secondary"
            className="gap-1.5 px-3 py-1.5 text-xs font-normal"
          >
            <span className="font-semibold text-secondary">{category.count}</span>
            {t(`discussion.tagsBilingual.${category.tag}`)}
          </Badge>
        ))}
      </div>
    </div>
  );
}
