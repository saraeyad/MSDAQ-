import { PageLoading } from "@/components/loading-spinner";
import type { LangVariant } from "@/features/public-site/article-page/types";
import {
  hasLanguageVariant,
  resolveArticleBody,
} from "@/features/public-site/article-page/article-content";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicPageHead } from "@/components/seo/PublicPageHead";
import { PodcastAudioPlayer } from "@/components/podcast-audio-player";
import { PublicArticleCover } from "@/components/article/cover-image";
import { ArticleVerifiedBadge } from "@/components/article/article-verified-badge";
import { PublicArticleAudioPlayer } from "@/features/public-site/components/PublicArticleAudioPlayer";
import { PublicArticleVideoPlayer } from "@/features/public-site/components/PublicArticleVideoPlayer";
import {
  publicArticleCoverUrl,
  publicArticlePosterUrl,
  publicMediaTypeLabel,
  resolveMediaUrl,
} from "@/lib/media";
import { buildArticleJsonLd, buildArticleSeoHead } from "@/lib/seo/article-seo";
import { useSiteOrigin } from "@/context/site-origin";
import { Button } from "@/components/ui/button";
import { Articles_APIs } from "@/services/api/articles";
import type { PublicArticle } from "@/types";
import { articlePath, ROUTES } from "@/router/routes";
import {
  articleAcceptsPublicReviews,
  trackArticleView,
  type TrustMediaProgress,
} from "@/lib/site";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { usePlatformFeedback } from "@/context/platform-feedback";
import { TrustIndexDialog } from "@/features/public-site/trust-index/TrustIndexDialog";
import { ArticleTrustFeedbackButton } from "@/features/public-site/trust-index/ArticleTrustFeedbackButton";
import { useTrustIndexMediaTrigger } from "@/features/public-site/trust-index/useTrustIndexMediaTrigger";
import { useTrustIndexTrigger } from "@/features/public-site/trust-index/useTrustIndexTrigger";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const RelatedArticlesSidebar = lazy(() =>
  import("@/features/public-site/article-page/RelatedArticlesSidebar").then(
    (module) => ({ default: module.RelatedArticlesSidebar }),
  ),
);

function useArticleTrustSurvey({
  articleId,
  mediaEnabled,
  enabled = true,
}: {
  articleId: number | string;
  mediaEnabled: boolean;
  enabled?: boolean;
}) {
  const [endEl, setEndEl] = useState<HTMLDivElement | null>(null);
  const [mediaProgress, setMediaProgress] = useState<TrustMediaProgress | null>(
    null,
  );
  const [manualOpen, setManualOpen] = useState(false);
  const { setTrustIndexOpen } = usePlatformFeedback();

  const textTrigger = useTrustIndexTrigger({
    articleId,
    endEl,
    enabled,
  });

  const mediaTrigger = useTrustIndexMediaTrigger({
    articleId,
    enabled: enabled && mediaEnabled,
    progress: mediaProgress,
  });

  const autoOpen = textTrigger.open || mediaTrigger.open;
  const open = enabled && (autoOpen || manualOpen);

  const dismiss = useCallback(() => {
    textTrigger.dismiss();
    mediaTrigger.dismiss();
    setManualOpen(false);
  }, [mediaTrigger, textTrigger]);

  const openManually = useCallback(() => {
    if (!enabled) return;
    setManualOpen(true);
  }, [enabled]);

  useEffect(() => {
    setManualOpen(false);
  }, [articleId, enabled]);

  useEffect(() => {
    setTrustIndexOpen(open);
    return () => setTrustIndexOpen(false);
  }, [open, setTrustIndexOpen]);

  return {
    endRef: setEndEl,
    open,
    dismiss,
    openManually,
    onMediaProgress: setMediaProgress,
  };
}

interface ArticlePageProps {
  initialArticle?: PublicArticle;
}

function ArticlePageContent({ article }: { article: PublicArticle }) {
  const [lang, setLang] = useState<LangVariant>("formal");
  const origin = useSiteOrigin();
  const seoHead = buildArticleSeoHead(article, origin);
  const jsonLd = buildArticleJsonLd(article, origin);
  const body = resolveArticleBody(article, lang);
  const queryClient = useQueryClient();
  const acceptingReviews = articleAcceptsPublicReviews(article);
  const coverUrl = publicArticleCoverUrl(article);
  const posterUrl = publicArticlePosterUrl(article);
  const coverCaption = article.cover_description?.trim() ?? "";
  const isAudio = article.media_type === "audio";
  const isVideo = article.media_type === "video";
  const {
    endRef,
    open,
    dismiss,
    openManually,
    onMediaProgress,
  } = useArticleTrustSurvey({
    articleId: article.id,
    mediaEnabled: isAudio || isVideo,
    enabled: acceptingReviews,
  });
  const sources = article.sources ?? [];
  const galleryImages =
    article.images
      ?.map((image) => resolveMediaUrl(image.full))
      .filter(Boolean) ?? [];
  const showLangToggle =
    hasLanguageVariant(article, "simplified") ||
    hasLanguageVariant(article, "dialect");

  useEffect(() => {
    trackArticleView({
      id: article.id,
      title: article.title,
      path: articlePath(article.id),
    });
  }, [article.id, article.title]);

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
            {isVideo ? (
              <PublicArticleVideoPlayer
                articleId={article.id}
                title={article.title}
                posterUrl={posterUrl}
                coverImage={article.cover_image}
                videoPoster={article.video_poster}
                className="mb-8"
                onVideoProgress={onMediaProgress}
              />
            ) : coverUrl ? (
              <figure className="article-cover-block mb-8">
                <PublicArticleCover
                  article={article}
                  alt={coverCaption || article.title}
                  priority
                  className="article-cover-block__image aspect-[21/9] w-full object-cover"
                />
                {coverCaption ? (
                  <figcaption className="article-cover-caption">
                    {coverCaption}
                  </figcaption>
                ) : null}
              </figure>
            ) : isAudio ? (
              <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-2xl">
                <PodcastAudioPlayer
                  seed={article.id}
                  variant="cover"
                  interactive={false}
                  className="size-full min-h-[12rem]"
                />
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="text-primary">
                {article.category?.name_ar ??
                  publicMediaTypeLabel(article.media_type)}
              </span>
              <span>•</span>
              <span>
                {new Date(article.published_at).toLocaleDateString("ar")}
              </span>
            </div>

            <h1 className="mt-4 font-headline text-3xl font-bold md:text-4xl">
              <span className="inline-flex flex-wrap items-center gap-2.5">
                {article.title}
                <ArticleVerifiedBadge article={article} />
              </span>
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

            {isAudio ? (
              <div className="mt-6">
                <PublicArticleAudioPlayer
                  articleId={article.id}
                  variant="embed"
                  coverUrl={coverUrl ?? undefined}
                  showSourceLink
                  onPlaybackProgress={onMediaProgress}
                />
              </div>
            ) : null}

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

            {acceptingReviews ? (
              <TrustIndexDialog
                articleId={article.id}
                open={open}
                onDismiss={dismiss}
                onSubmitted={() => {
                  void queryClient.invalidateQueries({
                    queryKey: ["public-article"],
                  });
                }}
              />
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
                      decoding="async"
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

            <div
              ref={endRef}
              className="h-8 w-full"
              aria-hidden
              data-trust-index-end
            />
          </div>

          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted" />}>
              <RelatedArticlesSidebar article={article} />
            </Suspense>
            {acceptingReviews ? (
              <ArticleTrustFeedbackButton
                onClick={openManually}
                disabled={open}
              />
            ) : null}
          </div>
        </div>
      </article>
    </>
  );
}

export default function ArticlePage({ initialArticle }: ArticlePageProps) {
  const { id } = useParams();

  const {
    data: article,
    isLoading,
    isError,
  } = useQuery({
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

  return <ArticlePageContent article={article} />;
}
