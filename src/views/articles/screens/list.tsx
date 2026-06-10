import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import ArticleCard from "../components/article-card";
import useArticlesList from "../hooks/useArticlesList";

export default function ArticlesList() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching } = useArticlesList({ page, search });
  const articles = data?.articles ?? [];
  const meta = data?.meta;
  const [featured, ...rest] = articles;

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <div className="articles-page section-gap">
      <div className="container-articles relative z-[1]">
        <header className="articles-animate-in mb-6 md:mb-8">
          <p className="text-label-caps text-secondary">{t("MENU.ARTICLES")}</p>
          <h1 className="page-title mt-2">{t("articles.listTitle")}</h1>
          <p className="page-description">{t("articles.listDescription")}</p>

          <form onSubmit={handleSearch} className="mt-6 flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t("articles.searchPlaceholder")}
                className="ps-9"
              />
            </div>
            <Button type="submit" variant="secondary">
              {t("articles.search")}
            </Button>
          </form>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : articles.length === 0 ? (
          <p className="py-16 text-center text-body-md text-muted-foreground">
            {t("articles.empty")}
          </p>
        ) : (
          <>
            {featured ? (
              <div className="mb-6 md:mb-8">
                <ArticleCard article={featured} variant="featured" animateIndex={0} />
              </div>
            ) : null}

            {rest.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {rest.map((article, index) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    animateIndex={index + 1}
                  />
                ))}
              </div>
            ) : null}

            {meta && meta.last_page > 1 ? (
              <div className="mt-10 flex items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                >
                  {t("articles.previousPage")}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {t("articles.pageOf", {
                    current: meta.current_page,
                    total: meta.last_page,
                  })}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  disabled={page >= meta.last_page || isFetching}
                  onClick={() =>
                    setPage((current) => Math.min(current + 1, meta.last_page))
                  }
                >
                  {t("articles.nextPage")}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
