import { PageLoading } from "@/components/loading-spinner";
import type { LangVariant } from "@/features/public-site/article-page/types";
import {
  hasLanguageVariant,
  resolveArticleBody,
} from "@/features/public-site/article-page/article-content";
import { RelatedArticlesSidebar } from "@/features/public-site/article-page/RelatedArticlesSidebar";
import { JsonLd } from "@/lib/seo/JsonLd";
import { PublicPageHead } from "@/lib/seo/PublicPageHead";
import { PodcastAudioPlayer } from "@/components/podcast-audio-player";
import { PublicArticleCover } from "@/lib/cover-image";
import { resolvePublicArticleAudioSource, publicMediaTypeLabel } from "@/lib/media-labels";
import { publicArticleCoverUrl, resolveMediaUrl } from "@/lib/media-url";
import {
  buildArticleJsonLd,
  buildArticleSeoHead,
} from "@/lib/seo/article-seo";
import { useSiteOrigin } from "@/context/site-origin";
import { Button } from "@/components/ui/button";
import { Articles_APIs } from "@/services/api/articles";
import type { PublicArticle } from "@/types";
import { ROUTES } from "@/router/routes";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";

interface ArticlePageProps {
  initialArticle?: PublicArticle;
}

export default function ArticlePage({ initialArticle }: ArticlePageProps) {
  const { id } = useParams();
  const [lang, setLang] = useState<LangVariant>("formal");

  const { data: article, isLoading, isError } = useQuery({
    queryKey: ["public-article", id],
    queryFn: () => Articles_APIs.get(id!),
    enabled: Boolean(id),
    initialData: initialArticle,
    retry: false,
  });

  if (isLoading && !article) {
    return (
      <div className="container-page">
        <PageLoading />
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="container-page py-10">
        <p>المقال غير موجود.</p>
      </div>
    );
  }

  const origin = useSiteOrigin();
  const seoHead = buildArticleSeoHead(article, origin);
  const jsonLd = buildArticleJsonLd(article, origin);
  const body = resolveArticleBody(article, lang);
  const audioSource = resolvePublicArticleAudioSource(article);
  const videoUrl = resolveMediaUrl(article.video ?? article.media_url);
  const coverUrl = publicArticleCoverUrl(article);
  const sources = article.sources ?? [];
  const galleryImages =
    article.images?.map((image) => resolveMediaUrl(image.full)).filter(Boolean) ??
    [];
  const showLangToggle =
    hasLanguageVariant(article, "simplified") ||
    hasLanguageVariant(article, "dialect");

  return (
    <>
      <PublicPageHead head={seoHead} />
      <JsonLd data={jsonLd} />

      <article className="container-page py-10">
        <Button asChild variant="ghost" size="sm" className="mb-6 gap-2">
          <Link to={ROUTES.ARTICLES}>
            <ArrowLeft className="size-4" />
            العودة للمقالات
          </Link>
        </Button>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0">
            {article.media_type === "audio" && !coverUrl ? (
              <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-2xl">
                <PodcastAudioPlayer
                  seed={article.id}
                  url={audioSource?.kind === "file" ? audioSource.url : null}
                  hostedPageUrl={
                    audioSource?.kind === "soundcloud"
                      ? audioSource.pageUrl
                      : null
                  }
                  variant="cover"
                  interactive={Boolean(audioSource)}
                  className="size-full min-h-[12rem]"
                />
              </div>
            ) : article.media_type === "video" && videoUrl ? (
              <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl bg-black">
                <video
                  src={videoUrl}
                  poster={
                    resolveMediaUrl(article.video_poster) ??
                    coverUrl ??
                    undefined
                  }
                  controls
                  className="size-full object-contain"
                />
              </div>
            ) : coverUrl ? (
              <PublicArticleCover
                article={article}
                alt={article.title}
                className="mb-8 aspect-[21/9] w-full rounded-2xl object-cover"
              />
            ) : null}

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="text-primary">
                {article.category?.name_ar ??
                  publicMediaTypeLabel(article.media_type)}
              </span>
              {article.author?.name && (
                <>
                  <span>•</span>
                  <span>{article.author.name}</span>
                </>
              )}
              <span>•</span>
              <span>
                {new Date(article.published_at).toLocaleDateString("ar")}
              </span>
            </div>

            <h1 className="mt-4 font-headline text-3xl font-bold md:text-4xl">
              {article.title}
            </h1>

            {article.description &&
            body !== article.description &&
            article.media_type !== "audio" ? (
              <p className="mt-4 text-lg text-muted-foreground">
                {article.description}
              </p>
            ) : null}

            {showLangToggle && (
              <div className="mt-6 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={lang === "formal" ? "default" : "outline"}
                  onClick={() => setLang("formal")}
                >
                  فصحى
                </Button>
                {hasLanguageVariant(article, "simplified") && (
                  <Button
                    size="sm"
                    variant={lang === "simplified" ? "default" : "outline"}
                    onClick={() => setLang("simplified")}
                  >
                    مبسّط
                  </Button>
                )}
                {hasLanguageVariant(article, "dialect") && (
                  <Button
                    size="sm"
                    variant={lang === "dialect" ? "default" : "outline"}
                    onClick={() => setLang("dialect")}
                  >
                    عامية
                  </Button>
                )}
              </div>
            )}

            {article.media_type === "audio" && audioSource && (
              <div className="mt-6">
                <PodcastAudioPlayer
                  seed={article.id}
                  url={audioSource.kind === "file" ? audioSource.url : null}
                  hostedPageUrl={
                    audioSource.kind === "soundcloud"
                      ? audioSource.pageUrl
                      : null
                  }
                  variant="embed"
                  interactive
                />
              </div>
            )}

            {article.media_type === "video" &&
              videoUrl &&
              article.media_url &&
              article.media_url !== videoUrl && (
                <div className="mt-6">
                  <a
                    href={article.media_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    مشاهدة على المنصة الخارجية
                  </a>
                </div>
              )}

            {body ? (
              <div className="prose prose-lg mt-8 max-w-none whitespace-pre-wrap leading-relaxed">
                {body}
              </div>
            ) : article.media_type !== "audio" &&
              article.media_type !== "video" ? (
              <p className="mt-8 text-muted-foreground">
                لا يوجد محتوى نصي لهذا المقال.
              </p>
            ) : null}

            {galleryImages.length > 0 && (
              <section className="mt-10">
                <h2 className="font-headline text-xl font-semibold">
                  معرض الصور
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {galleryImages.map((imageUrl, index) => (
                    <img
                      key={`${imageUrl}-${index}`}
                      src={imageUrl!}
                      alt=""
                      className="w-full rounded-xl object-cover"
                      loading="lazy"
                    />
                  ))}
                </div>
              </section>
            )}

            {sources.length > 0 && (
              <section className="mt-12 rounded-xl border border-border bg-card p-6">
                <h2 className="font-headline text-xl font-semibold">المصادر</h2>
                <ul className="mt-4 space-y-2">
                  {sources.map((source) => (
                    <li key={source.id} className="text-sm">
                      <span className="font-medium">{source.source}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <RelatedArticlesSidebar
            article={article}
            className="lg:sticky lg:top-24 lg:self-start"
          />
        </div>
      </article>
    </>
  );
}
