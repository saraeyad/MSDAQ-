import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/router/routes";
import type { Article, ArticleLanguage } from "@/types/article";
import { ChevronLeft, ExternalLink, Loader } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import ArticleContentBody from "../components/article-content-body";
import ArticleCoverImage from "../components/article-cover-image";
import ArticleCredibilitySidebar from "../components/article-credibility-sidebar";
import ArticleHeaderMeta from "../components/article-header-meta";
import ArticleLanguageToggle from "../components/article-language-toggle";
import ArticleScoreTimeline from "../components/article-score-timeline";
import ArticleSourcesTable from "../components/article-sources-table";
import useArticleDetail from "../hooks/useArticleDetail";

export default function ArticleDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: article, isLoading, isError } = useArticleDetail(id);

  const availableLanguages = useMemo(
    () => getAvailableLanguages(article),
    [article],
  );

  const [language, setLanguage] = useState<ArticleLanguage>("fusha");

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="articles-page section-gap">
        <div className="container-articles">
          <p className="text-body-md text-muted-foreground">
            {t("articles.notFound")}
          </p>
        </div>
      </div>
    );
  }

  const activeLanguage = availableLanguages.includes(language)
    ? language
    : (availableLanguages[0] ?? "fusha");

  return (
    <div className="articles-page section-gap pb-16">
      <div className="container-page relative z-[1]">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link
            to={ROUTES.ARTICLES}
            className="inline-flex items-center gap-1 font-medium text-secondary hover:underline"
          >
            <ChevronLeft className="size-4" />
            {t("articles.backToList")}
          </Link>
          <span aria-hidden>/</span>
          <span className="line-clamp-1 max-w-md">{article.title}</span>
        </nav>

        {availableLanguages.length > 1 ? (
          <div
            className="articles-animate-in mt-3 flex justify-end"
            style={{ animationDelay: "60ms" }}
          >
            <ArticleLanguageToggle
              value={activeLanguage}
              onChange={setLanguage}
              availableLanguages={availableLanguages}
            />
          </div>
        ) : null}

        <header
          className="articles-animate-in mt-4 space-y-4 md:mt-5 md:space-y-5"
          style={{ animationDelay: "100ms" }}
        >
          <h1 className="text-display-lg max-w-4xl">{article.title}</h1>
          <ArticleHeaderMeta article={article} />
          {article.tags && article.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          ) : null}
        </header>

        <div
          className="articles-hero-animate mt-6 overflow-hidden rounded-lg border border-border md:mt-7"
          style={{ animationDelay: "180ms" }}
        >
          <ArticleCoverImage
            src={article.featuredImage}
            alt={article.title}
            aspect="hero"
            loading="eager"
          />
          {article.featuredImageCaption ? (
            <p className="border-t border-border bg-muted/30 px-4 py-2 text-center text-sm text-muted-foreground">
              {article.featuredImageCaption}
            </p>
          ) : null}
        </div>

        <div
          className="articles-animate-in mt-8 grid gap-8 lg:grid-cols-12 lg:gap-10"
          style={{ animationDelay: "260ms" }}
        >
          <article className="space-y-12 lg:col-span-8">
            <ArticleContentBody article={article} language={activeLanguage} />

            {article.originalUrl ? (
              <div className="max-w-3xl rounded border border-border bg-muted/30 p-6">
                <p className="text-body-md leading-relaxed text-muted-foreground">
                  {t("articles.affiliatedOutletMessage")}
                </p>
                <a
                  href={article.originalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 font-medium text-secondary hover:underline"
                >
                  {t("articles.readAtOutlet")}
                  <ExternalLink className="size-4" />
                </a>
              </div>
            ) : null}

            {article.scoreHistory.length ? (
              <ArticleScoreTimeline history={article.scoreHistory} />
            ) : null}
            {article.sources.length ? (
              <ArticleSourcesTable sources={article.sources} />
            ) : null}
          </article>

          <aside className="lg:col-span-4">
            <div className="sticky top-24">
              <ArticleCredibilitySidebar article={article} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function getAvailableLanguages(article?: Article): ArticleLanguage[] {
  if (!article) return ["fusha"];

  const languages: ArticleLanguage[] = [];
  if (article.content.fusha) languages.push("fusha");
  if (article.content.simple) languages.push("simple");
  if (article.content.dialect) languages.push("dialect");
  return languages.length ? languages : ["fusha"];
}
