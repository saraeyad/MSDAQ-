import { PageLoading } from "@/components/loading-spinner";
import type { LangVariant } from "@/features/public-site/article-page/types";
import { ArticleEntityBody } from "@/features/public-site/article-page/ArticleEntityBody";
import { ArticleTranslateButton } from "@/features/public-site/article-page/ArticleTranslateButton";
import {
  ARTICLE_CONTENT_LANG_PARAM,
  otherArticleContentLang,
  parseArticleContentLang,
} from "@/features/public-site/article-page/article-content-lang";
import {
  hasLanguageVariant,
  resolveArticleBody,
} from "@/features/public-site/article-page/article-content";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicPageHead } from "@/components/seo/PublicPageHead";
import { PodcastAudioPlayer } from "@/components/podcast-audio-player";
import { PublicArticleCover } from "@/components/article/cover-image";
import { ArticleVerifiedBadge } from "@/components/article/article-verified-badge";
import {
  isEnglishArticlePending,
  PublicArticleEnglishPendingPanel,
} from "@/features/public-site/components/PublicArticleEnglishPending";
import { PublicArticleAudioPlayer } from "@/features/public-site/components/PublicArticleAudioPlayer";
import { PublicArticleVideoPlayer } from "@/features/public-site/components/PublicArticleVideoPlayer";
import { useLocale, usePublicCopy } from "@/context/locale";
import { localizedCategoryName } from "@/lib/i18n/localized-category";
import type { Locale } from "@/lib/i18n/types";
import { publicMediaTypeLabelFromCopy } from "@/lib/i18n/public-media-labels";
import { publicArticleCoverUrl, resolveMediaUrl } from "@/lib/media";
import { buildArticleJsonLd, buildArticleSeoHead } from "@/lib/seo/article-seo";
import { loadLatinUiFont } from "@/lib/site/optional-fonts";
import { useSiteOrigin } from "@/context/site-origin";
import { Button } from "@/components/ui/button";
import { Articles_APIs } from "@/services/api/articles";
import type { PublicArticle } from "@/types";
import { articlePath, ROUTES } from "@/router/routes";
import {
  articleAcceptsPublicReviews,
  countWords,
  trackArticleView,
  type TrustMediaProgress,
} from "@/lib/site";
import { ArrowLeft } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { usePlatformFeedback } from "@/context/platform-feedback";
import { TrustIndexDialog } from "@/features/public-site/trust-index/TrustIndexDialog";
import { ArticleTrustFeedbackButton } from "@/features/public-site/trust-index/ArticleTrustFeedbackButton";
import { useTrustIndexMediaTrigger } from "@/features/public-site/trust-index/useTrustIndexMediaTrigger";
import { useTrustIndexTrigger } from "@/features/public-site/trust-index/useTrustIndexTrigger";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const RelatedArticlesSidebar = lazy(() =>
  import("@/features/public-site/article-page/RelatedArticlesSidebar").then(
    (module) => ({ default: module.RelatedArticlesSidebar }),
  ),
);

function useArticleTrustSurvey({
  articleId,
  body,
  mediaEnabled,
  enabled = true,
}: {
  articleId: number | string;
  body: string;
  mediaEnabled: boolean;
  enabled?: boolean;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [mediaProgress, setMediaProgress] = useState<TrustMediaProgress | null>(
    null,
  );
  const [manualOpen, setManualOpen] = useState(false);
  const { setTrustIndexOpen } = usePlatformFeedback();
  const wordCount = useMemo(() => countWords(body), [body]);

  const textTrigger = useTrustIndexTrigger({
    articleId,
    wordCount,
    bodyRef,
    enabled: enabled && wordCount > 0,
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
    bodyRef,
    open,
    dismiss,
    openManually,
    onMediaProgress: setMediaProgress,
  };
}

interface ArticlePageProps {
  initialArticle?: PublicArticle;
}

function ArticlePageContent({
  article,
  articleUrlId,
}: {
  article: PublicArticle;
  articleUrlId: string;
}) {
  const [lang, setLang] = useState<LangVariant>("formal");
  const { locale } = useLocale();
  const copy = usePublicCopy();
  const { article: articleCopy } = copy;
  const [searchParams, setSearchParams] = useSearchParams();
  const contentLang: Locale =
    parseArticleContentLang(searchParams.get(ARTICLE_CONTENT_LANG_PARAM)) ??
    locale;
  const needsLocalizedFetch = contentLang !== locale;
  const {
    data: localizedArticle,
    isPending: isContentPending,
    isError: isContentError,
  } = useQuery({
    queryKey: ["public-article", contentLang, articleUrlId],
    queryFn: () => Articles_APIs.get(articleUrlId, contentLang),
    enabled: needsLocalizedFetch,
    staleTime: 5 * 60 * 1000,
  });
  const englishFetchPending =
    contentLang === "en" &&
    Boolean(localizedArticle) &&
    isEnglishArticlePending(localizedArticle!, "en");
  const keepOriginalWhileEnglishPending =
    englishFetchPending && locale === "ar";
  const displayArticle =
    keepOriginalWhileEnglishPending || !needsLocalizedFetch || !localizedArticle
      ? article
      : localizedArticle;
  const contentLoading = needsLocalizedFetch && isContentPending;
  const [translationNotice, setTranslationNotice] = useState(false);
  const dateLocale = locale === "ar" ? "ar" : "en-GB";
  const origin = useSiteOrigin();
  const seoHead = buildArticleSeoHead(article, origin);
  const jsonLd = buildArticleJsonLd(article, origin);
  const englishPending =
    !contentLoading &&
    !keepOriginalWhileEnglishPending &&
    isEnglishArticlePending(displayArticle, contentLang);
  const displayTitle = englishPending
    ? articleCopy.englishPendingTitle
    : displayArticle.title;
  const body = englishPending ? "" : resolveArticleBody(displayArticle, lang);
  const contentDir = contentLang === "en" ? "ltr" : "rtl";

  const setContentLang = useCallback(
    (next: Locale) => {
      setLang("formal");
      setSearchParams(
        (current) => {
          const nextParams = new URLSearchParams(current);
          if (next === locale) nextParams.delete(ARTICLE_CONTENT_LANG_PARAM);
          else nextParams.set(ARTICLE_CONTENT_LANG_PARAM, next);
          return nextParams;
        },
        { replace: true },
      );
    },
    [locale, setSearchParams],
  );

  useEffect(() => {
    setTranslationNotice(false);
  }, [article.id]);

  useEffect(() => {
    if (!keepOriginalWhileEnglishPending) return;
    setTranslationNotice(true);
    setContentLang("ar");
  }, [keepOriginalWhileEnglishPending, setContentLang]);
  const queryClient = useQueryClient();
  const acceptingReviews = articleAcceptsPublicReviews(article);
  const { data: articleMedia } = useQuery({
    queryKey: ["public", "article-media", String(article.id)],
    queryFn: () => Articles_APIs.getMedia(article.id),
    staleTime: Infinity,
  });
  const coverUrl = publicArticleCoverUrl(article);
  const posterUrl = publicArticleCoverUrl(article);
  const coverCaption = article.cover_description?.trim() ?? "";
  const isAudio = article.media_type === "audio";
  const isVideo = article.media_type === "video";
  const { bodyRef, open, dismiss, openManually, onMediaProgress } =
    useArticleTrustSurvey({
      articleId: article.id,
      body,
      mediaEnabled: isAudio || isVideo,
      enabled: acceptingReviews && !englishPending,
    });
  const sources = englishPending
    ? []
    : (displayArticle.sources ?? article.sources ?? []);
  const galleryImages =
    articleMedia?.images
      ?.map((image) => resolveMediaUrl(image.full))
      .filter(Boolean) ?? [];
  const showLangToggle =
    contentLang === "ar" &&
    (hasLanguageVariant(displayArticle, "simplified") ||
      hasLanguageVariant(displayArticle, "dialect"));

  useEffect(() => {
    if (contentLang === "en") loadLatinUiFont();
  }, [contentLang]);

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
            {articleCopy.backToArticles}
          </Link>
        </Button>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0">
            {isVideo ? (
              <PublicArticleVideoPlayer
                articleId={article.id}
                title={displayTitle}
                posterUrl={posterUrl}
                coverImage={article.cover_image}
                videoPoster={null}
                className="mb-8"
                onVideoProgress={onMediaProgress}
              />
            ) : coverUrl ? (
              <figure className="article-cover-block mb-8">
                <PublicArticleCover
                  article={article}
                  alt={coverCaption || displayTitle}
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

            <div className="article-meta-row">
              <div className="article-meta-row__facts">
                <span className="text-primary">
                  {(article.category
                    ? localizedCategoryName(article.category, locale)
                    : null) ??
                    publicMediaTypeLabelFromCopy(copy, article.media_type)}
                </span>
                <span>•</span>
                <span>
                  {new Date(article.published_at).toLocaleDateString(
                    dateLocale,
                  )}
                </span>
              </div>
              <ArticleTranslateButton
                contentLang={contentLang}
                loading={contentLoading}
                onToggle={() =>
                  setContentLang(otherArticleContentLang(contentLang))
                }
              />
            </div>
            {isContentError ? (
              <p className="article-translate-error" role="alert">
                {articleCopy.translateFailed}
              </p>
            ) : translationNotice ? (
              <p className="article-translate-error" role="status">
                {articleCopy.englishPendingLead}
              </p>
            ) : null}

            <div
              className="article-content"
              dir={contentDir}
              lang={contentLang}
            >
              {englishPending ? (
                <PublicArticleEnglishPendingPanel className="mt-6" />
              ) : (
                <>
                  <h1 className="mt-4 font-headline text-3xl font-bold md:text-4xl">
                    <span className="inline-flex flex-wrap items-center gap-2.5">
                      <span>
                        <ArticleEntityBody
                          text={displayArticle.title}
                          entities={displayArticle.entities}
                          tone="heading"
                        />
                      </span>
                      <ArticleVerifiedBadge article={article} />
                    </span>
                  </h1>

                  {displayArticle.description &&
                  body !== displayArticle.description ? (
                    <p className="mt-4 text-lg text-muted-foreground">
                      <ArticleEntityBody
                        text={displayArticle.description}
                        entities={displayArticle.entities}
                      />
                    </p>
                  ) : null}
                </>
              )}

              {showLangToggle && (
                <div className="mt-6 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={lang === "formal" ? "default" : "outline"}
                    onClick={() => setLang("formal")}
                  >
                    {articleCopy.langFormal}
                  </Button>
                  {hasLanguageVariant(displayArticle, "simplified") && (
                    <Button
                      size="sm"
                      variant={lang === "simplified" ? "default" : "outline"}
                      onClick={() => setLang("simplified")}
                    >
                      {articleCopy.langSimplified}
                    </Button>
                  )}
                  {hasLanguageVariant(displayArticle, "dialect") && (
                    <Button
                      size="sm"
                      variant={lang === "dialect" ? "default" : "outline"}
                      onClick={() => setLang("dialect")}
                    >
                      {articleCopy.langDialect}
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

              {!englishPending && body ? (
                <div
                  ref={bodyRef}
                  className="prose prose-lg mt-8 max-w-none whitespace-pre-wrap leading-relaxed"
                >
                  <ArticleEntityBody
                    text={body}
                    entities={displayArticle.entities}
                  />
                </div>
              ) : !englishPending &&
                article.media_type !== "audio" &&
                article.media_type !== "video" ? (
                <p className="mt-8 text-muted-foreground">
                  {articleCopy.noTextContent}
                </p>
              ) : null}
            </div>

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
                  {articleCopy.galleryHeading}
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
                <h2 className="font-headline text-xl font-semibold">
                  {articleCopy.sourcesHeading}
                </h2>
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

          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Suspense
              fallback={
                <div className="h-40 animate-pulse rounded-xl bg-muted" />
              }
            >
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
  const { locale } = useLocale();
  const { article: articleCopy } = usePublicCopy();

  const {
    data: article,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["public-article", locale, id],
    queryFn: () => Articles_APIs.get(id!, locale),
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
        <p>{articleCopy.notFound}</p>
      </div>
    );
  }

  return <ArticlePageContent article={article} articleUrlId={id!} />;
}
