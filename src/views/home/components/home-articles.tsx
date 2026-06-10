import { ROUTES } from "@/router/routes";
import ArticleCard from "@/views/articles/components/article-card";
import { ArrowUpRight, Loader } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import useHomeArticles from "../hooks/useHomeArticles";

export default function HomeArticles() {
  const { t } = useTranslation();
  const { data: articles, isLoading } = useHomeArticles();

  return (
    <section className="home-section-gap border-t border-border/80 bg-card/55 backdrop-blur-sm">
      <div className="container-page">
        <div className="articles-animate-in mb-8 flex items-end justify-between gap-4 md:mb-10">
          <div>
            <p className="text-label-caps text-secondary">
              {t("home.tools.articles")}
            </p>
            <h2 className="text-headline-md mt-2">
              {t("home.latestArticles")}
            </h2>
            <p className="mt-2 max-w-xl text-body-md text-muted-foreground">
              {t("home.articlesSubtitle")}
            </p>
          </div>
          <Link
            to={ROUTES.ARTICLES}
            className="group hidden items-center gap-1 text-body-md text-secondary hover:underline sm:flex"
          >
            {t("home.viewAll")}
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
            {articles?.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant="compact"
                animateIndex={index}
              />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            to={ROUTES.ARTICLES}
            className="text-body-md font-medium text-secondary hover:underline"
          >
            {t("home.viewAll")}
          </Link>
        </div>
      </div>
    </section>
  );
}
