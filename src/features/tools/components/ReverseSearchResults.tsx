import type { ReverseSearchMatch } from "@/types";
import { ExternalLink, ImageOff, SearchX } from "lucide-react";

interface ReverseSearchResultsProps {
  results: ReverseSearchMatch[];
  title?: string;
  className?: string;
}

function formatMatchDate(date?: string | null): string | null {
  if (!date?.trim()) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("ar", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function domainInitial(domain: string): string {
  const cleaned = domain.replace(/^www\./i, "").trim();
  return cleaned.charAt(0).toUpperCase() || "?";
}

export function ReverseSearchResults({
  results,
  title = "نتائج البحث العكسي",
  className,
}: ReverseSearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className={`reverse-search-results reverse-search-results--empty ${className ?? ""}`}>
        <span className="reverse-search-results__empty-icon" aria-hidden>
          <SearchX className="size-6" strokeWidth={1.75} />
        </span>
        <p className="reverse-search-results__empty-title">لا توجد نتائج مطابقة</p>
        <p className="reverse-search-results__empty-desc">
          لم نعثر على استخدامات أخرى لهذه الصورة في المصادر المتاحة.
        </p>
      </div>
    );
  }

  return (
    <div className={`reverse-search-results ${className ?? ""}`}>
      <header className="reverse-search-results__header">
        <div>
          <h3 className="reverse-search-results__title">{title}</h3>
          <p className="reverse-search-results__subtitle">
            عُثر على {results.length}{" "}
            {results.length === 1 ? "مصدر مطابق" : "مصادر مطابقة"}
          </p>
        </div>
        <span className="reverse-search-results__count">{results.length}</span>
      </header>

      <ul className="reverse-search-results__list">
        {results.map((match, index) => {
          const formattedDate = formatMatchDate(match.date);

          return (
            <li key={`${match.link}-${index}`}>
              <a
                href={match.link}
                target="_blank"
                rel="noopener noreferrer"
                className="reverse-search-results__item"
              >
                <div className="reverse-search-results__thumb">
                  {match.image ? (
                    <img
                      src={match.image}
                      alt=""
                      className="reverse-search-results__thumb-img"
                      loading="lazy"
                    />
                  ) : (
                    <span className="reverse-search-results__thumb-fallback" aria-hidden>
                      <ImageOff className="size-5" strokeWidth={1.75} />
                    </span>
                  )}
                </div>

                <div className="reverse-search-results__body">
                  <div className="reverse-search-results__meta">
                    <span className="reverse-search-results__domain">
                      {match.logo ? (
                        <img
                          src={match.logo}
                          alt=""
                          className="reverse-search-results__domain-logo"
                          loading="lazy"
                        />
                      ) : (
                        <span className="reverse-search-results__domain-badge">
                          {domainInitial(match.domain)}
                        </span>
                      )}
                      <span dir="ltr">{match.domain}</span>
                    </span>
                    {formattedDate ? (
                      <time className="reverse-search-results__date">{formattedDate}</time>
                    ) : null}
                  </div>
                  <p className="reverse-search-results__match-title">
                    {match.title?.trim() || match.domain}
                  </p>
                  <p className="reverse-search-results__link" dir="ltr">
                    {match.link}
                  </p>
                </div>

                <span className="reverse-search-results__external" aria-hidden>
                  <ExternalLink className="size-4" strokeWidth={1.75} />
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}