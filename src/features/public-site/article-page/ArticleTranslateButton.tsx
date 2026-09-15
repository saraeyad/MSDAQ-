import { useLocale, usePublicCopy } from "@/context/locale";
import {
  articleContentLangPath,
  otherArticleContentLang,
} from "@/features/public-site/article-page/article-content-lang";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/types";
import { Languages, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface ArticleTranslateButtonProps {
  contentLang: Locale;
  articleId?: number | string;
  loading?: boolean;
  compact?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function ArticleTranslateButton({
  contentLang,
  articleId,
  loading = false,
  compact = false,
  onToggle,
  className,
}: ArticleTranslateButtonProps) {
  const { locale } = useLocale();
  const { article: articleCopy } = usePublicCopy();
  const target = otherArticleContentLang(contentLang);
  const label =
    target === "en" ? articleCopy.showEnglish : articleCopy.showArabic;
  const aria =
    target === "en"
      ? articleCopy.translateAriaToEnglish
      : articleCopy.translateAriaToArabic;
  const classNames = cn(
    "article-translate",
    compact && "article-translate--compact",
    className,
  );

  if (onToggle) {
    return (
      <button
        type="button"
        className={classNames}
        onClick={onToggle}
        disabled={loading}
        aria-label={aria}
      >
        {loading ? (
          <Loader2 className="article-translate__icon animate-spin" aria-hidden />
        ) : (
          <Languages className="article-translate__icon" aria-hidden />
        )}
        <span>{loading ? articleCopy.translating : label}</span>
      </button>
    );
  }

  if (!articleId) return null;

  return (
    <Link
      to={articleContentLangPath(articleId, target, locale)}
      className={classNames}
      aria-label={aria}
      onClick={(event) => event.stopPropagation()}
    >
      <Languages className="article-translate__icon" aria-hidden />
      <span>{label}</span>
    </Link>
  );
}
