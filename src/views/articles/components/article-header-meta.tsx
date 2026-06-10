import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Article } from "@/types/article";
import { Bookmark, Printer, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ArticleHeaderMetaProps {
  article: Article;
}

export default function ArticleHeaderMeta({ article }: ArticleHeaderMetaProps) {
  const { t } = useTranslation();

  const publishedDate = new Date(article.publishedAt).toLocaleDateString(
    undefined,
    { day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
      <div className="flex items-center gap-3">
        <Avatar className="size-10">
          {article.authorAvatar ? (
            <AvatarImage src={article.authorAvatar} alt={article.author} />
          ) : null}
          <AvatarFallback className="bg-muted text-sm font-medium">
            {article.author.slice(0, 1)}
          </AvatarFallback>
        </Avatar>
        <div className="text-body-md">
          <p className="font-medium">
            {t("articles.byAuthor", { author: article.author })}
          </p>
          <p className="text-muted-foreground">
            {publishedDate}
            {article.readingTimeMinutes
              ? ` | ${t("articles.readingTime", { minutes: article.readingTimeMinutes })}`
              : null}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-muted-foreground">
        <button
          type="button"
          aria-label={t("articles.print")}
          className="hover:text-secondary"
        >
          <Printer className="size-5" />
        </button>
        <button
          type="button"
          aria-label={t("articles.bookmark")}
          className="hover:text-secondary"
        >
          <Bookmark className="size-5" />
        </button>
        <button
          type="button"
          aria-label={t("articles.share")}
          className="hover:text-secondary"
        >
          <Share2 className="size-5" />
        </button>
      </div>
    </div>
  );
}
