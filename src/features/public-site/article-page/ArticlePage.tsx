import { PageLoading } from "@/components/loading-spinner";
import type { LangVariant } from "@/features/public-site/article-page/types";
import {
  hasLanguageVariant,
  resolveArticleBody,
} from "@/features/public-site/article-page/article-content";
import { RelatedArticlesSidebar } from "@/features/public-site/article-page/RelatedArticlesSidebar";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicPageHead } from "@/components/seo/PublicPageHead";
import { PodcastAudioPlayer } from "@/components/podcast-audio-player";
import { PublicArticleCover } from "@/components/cover-image";
import { ArticleVerifiedBadge } from "@/components/article-verified-badge";
import { resolvePublicArticleAudioSource, publicMediaTypeLabel } from "@/lib/media-labels";
import { publicArticleCoverUrl, resolveMediaUrl, resolvePlayableVideoUrl, youtubeEmbedUrl } from "@/lib/media-url";
import {
  buildArticleJsonLd,
  buildArticleSeoHead,
} from "@/lib/seo/article-seo";
import { useSiteOrigin } from "@/context/site-origin";
import { Button } from "@/components/ui/button";
import { Articles_APIs } from "@/services/api/articles";
import type { PublicArticle } from "@/types";
import { articlePath, ROUTES } from "@/router/routes";
import { trackArticleView } from "@/lib/google-analytics";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { usePlatformFeedback } from "@/context/platform-feedback";
import { TrustIndexDialog } from "@/features/public-site/trust-index/TrustIndexDialog";
import { ArticleTrustFeedbackButton } from "@/features/public-site/trust-index/ArticleTrustFeedbackButton";
import { useTrustIndexMediaTrigger } from "@/features/public-site/trust-index/useTrustIndexMediaTrigger";
import { useTrustIndexTrigger } from "@/features/public-site/trust-index/useTrustIndexTrigger";
import {
  articleAcceptsPublicReviews,
  countWords,
  type TrustMediaProgress,
} from "@/lib/trust-index-labels";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaProgress, setMediaProgress] = useState<TrustMediaProgress | null>(
    null,
  );
  const [manualOpen, setManualOpen] = useState(false);
  const wordCount = useMemo(() => countWords(body), [body]);
  const { setTrustIndexOpen } = usePlatformFeedback();
  const hasTextBody = wordCount > 0;

  const textTrigger = useTrustIndexTrigger({
    articleId,
    wordCount,
    bodyRef,
    enabled: enabled && hasTextBody,
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

  const onVideoProgress = (ended = false) => {
    const video = videoRef.current;
    if (!video) return;
    setMediaProgress({
      currentTime: video.currentTime,
      duration: Number.isFinite(video.duration) ? video.duration : 0,
      isPlaying: !video.paused && !video.ended,
      ended: ended || video.ended,
    });
  };

  return {
    bodyRef,
    videoRef,
    open,
    dismiss,
    openManually,
    onAudioProgress: setMediaProgress,
    onVideoProgress,
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
  const audioSource = resolvePublicArticleAudioSource(article);
  const playableVideoUrl = resolvePlayableVideoUrl(article.video, {
    coverImage: article.cover_image,
    videoPoster: article.video_poster,
  });
  const youtubeEmbed =
    youtubeEmbedUrl(article.media_url) ?? youtubeEmbedUrl(article.video);
  const coverUrl = publicArticleCoverUrl(article);
  const isAudio = article.media_type === "audio";
  const isVideo = article.media_type === "video";
  const hasPlayableAudio = isAudio && Boolean(audioSource);
  const hasPlayableVideo = isVideo && Boolean(playableVideoUrl);
  const {
    bodyRef,
    videoRef,
    open,
    dismiss,
    openManually,
    onAudioProgress,
    onVideoProgress,
  } = useArticleTrustSurvey({
    articleId: article.id,
    body,
    mediaEnabled: hasPlayableAudio || hasPlayableVideo,
    enabled: acceptingReviews,
  });
  const sources = article.sources ?? [];
  const galleryImages =
    article.images?.map((image) => resolveMediaUrl(image.full)).filter(Boolean) ??
    [];
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
            {article.media_type === "video" && youtubeEmbed ? (
              <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl bg-black">
                <iframe
                  src={youtubeEmbed}
                  title={article.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 size-full border-0"
                />
              </div>
            ) : article.media_type === "video" && playableVideoUrl ? (
              <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl bg-black">
                <video
                  ref={videoRef}
                  src={playableVideoUrl}
                  poster={
                    resolveMediaUrl(article.video_poster) ??
                    coverUrl ??
                    undefined
                  }
                  controls
                  className="size-full object-contain"
                  onTimeUpdate={() => onVideoProgress()}
                  onPlay={() => onVideoProgress()}
                  onPause={() => onVideoProgress()}
                  onEnded={() => onVideoProgress(true)}
                />
              </div>
            ) : coverUrl ? (
              <PublicArticleCover
                article={article}
                alt={article.title}
                className="mb-8 aspect-[21/9] w-full rounded-2xl object-cover"
              />
            ) : article.media_type === "audio" ? (
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
                  onPlaybackProgress={onAudioProgress}
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
                  onPlaybackProgress={onAudioProgress}
                />
              </div>
            )}

            {article.media_type === "video" &&
              article.media_url &&
              !youtubeEmbed &&
              article.media_url !== playableVideoUrl && (
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
              <div
                ref={bodyRef}
                className="prose prose-lg mt-8 max-w-none whitespace-pre-wrap leading-relaxed"
              >
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

          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <RelatedArticlesSidebar article={article} />
            {acceptingReviews ? (
              <ArticleTrustFeedbackButton onClick={openManually} disabled={open} />
            ) : null}
          </div>
        </div>
      </article>
    </>
  );
}

export default function ArticlePage({ initialArticle }: ArticlePageProps) {
  const { id } = useParams();

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

  return <ArticlePageContent article={article} />;
}
