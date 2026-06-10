import { cn } from "@/lib/utils";
import type { ArticleLanguage } from "@/types/article";
import { useTranslation } from "react-i18next";

interface ArticleLanguageToggleProps {
  value: ArticleLanguage;
  onChange: (lang: ArticleLanguage) => void;
  availableLanguages?: ArticleLanguage[];
}

const LANGUAGES: ArticleLanguage[] = ["fusha", "simple", "dialect"];

export default function ArticleLanguageToggle({
  value,
  onChange,
  availableLanguages = LANGUAGES,
}: ArticleLanguageToggleProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {availableLanguages.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => onChange(lang)}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            value === lang
              ? "border-border bg-muted text-foreground"
              : "border-transparent bg-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {t(`articles.language.${lang}`)}
        </button>
      ))}
    </div>
  );
}
