import { PublicArticleCover } from "@/components/article/cover-image";
import { ArticleVerifiedBadge } from "@/components/article/article-verified-badge";
import {
  isEnglishArticlePending,
  PublicArticleEnglishPendingBadge,
} from "@/features/public-site/components/PublicArticleEnglishPending";
import { useLocale, usePublicCopy } from "@/context/locale";
import { localizedCategoryName } from "@/lib/i18n/localized-category";
import { publicMediaTypeLabelFromCopy } from "@/lib/i18n/public-media-labels";
import { cn } from "@/lib/utils";
import { articlePath } from "@/router/routes";
import type { PublicArticle } from "@/types";
import { Mic, Play } from "lucide-react";
import { Link } from "react-router-dom";

function postedLabel(iso: string, locale: "ar" | "en") {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat(locale === "ar" ? "ar" : "en", {
    numeric: "auto",
  });
  if (abs < 60) return rtf.format(Math.round(diffSec), "second");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (abs < 86400 * 7) return rtf.format(Math.round(diffSec / 86400), "day");
  return date.toLocaleDateString(locale === "ar" ? "ar" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StoryMedia({
  article,
  priority = false,
}: {
  article: PublicArticle;
  priority?: boolean;
}) {
  const isVideo = article.media_type === "video";
  const isAudio = article.media_type === "audio";

  return (
    <span className="category-story-media">
      <PublicArticleCover
        article={article}
        priority={priority}
        className="category-story-media__img"
      />
      {isVideo || isAudio ? (
        <span className="category-story-media__mark" aria-hidden>
          {isAudio ? (
            <Mic className="size-3.5" />
          ) : (
            <Play className="size-3.5 fill-current" />
          )}
        </span>
      ) : null}
    </span>
  );
}

function StoryTitle({
  article,
  className,
  heading = "h2",
}: {
  article: PublicArticle;
  className?: string;
  heading?: "h2" | "h3";
}) {
  const { locale } = useLocale();
  const pending = isEnglishArticlePending(article, locale);
  const TitleTag = heading;

  return (
    <TitleTag className={cn("sport-title", className)}>
      <Link to={articlePath(article.id)}>
        {pending ? <PublicArticleEnglishPendingBadge /> : article.title}
      </Link>
    </TitleTag>
  );
}

function StoryMeta({
  article,
  showTopic,
}: {
  article: PublicArticle;
  showTopic: boolean;
}) {
  const { locale } = useLocale();
  const copy = usePublicCopy();
  const topic = showTopic
    ? article.category
      ? localizedCategoryName(article.category, locale)
      : publicMediaTypeLabelFromCopy(copy, article.media_type)
    : "";
  const posted = postedLabel(article.published_at, locale);
  const pending = isEnglishArticlePending(article, locale);

  return (
    <p className="sport-meta">
      {!pending ? (
        <ArticleVerifiedBadge article={article} compact className="sport-verified" />
      ) : null}
      {topic ? <span className="sport-meta__topic">{topic}</span> : null}
      {posted ? (
        <time dateTime={article.published_at}>{posted}</time>
      ) : null}
    </p>
  );
}

function StoryExcerpt({ article }: { article: PublicArticle }) {
  const { locale } = useLocale();
  if (isEnglishArticlePending(article, locale) || !article.description) {
    return null;
  }
  return <p className="sport-excerpt">{article.description}</p>;
}

function MediaLink({
  article,
  priority = false,
}: {
  article: PublicArticle;
  priority?: boolean;
}) {
  return (
    <Link
      to={articlePath(article.id)}
      className="sport-media"
      tabIndex={-1}
      aria-hidden
    >
      <StoryMedia article={article} priority={priority} />
    </Link>
  );
}

function LeadStory({
  article,
  showTopic,
}: {
  article: PublicArticle;
  showTopic: boolean;
}) {
  return (
    <article className="sport-lead">
      <MediaLink article={article} priority />
      <StoryTitle article={article} className="sport-title--lead" />
      <StoryExcerpt article={article} />
      <StoryMeta article={article} showTopic={showTopic} />
    </article>
  );
}

function StackStory({
  article,
  showTopic,
}: {
  article: PublicArticle;
  showTopic: boolean;
}) {
  return (
    <article className="sport-stack">
      <MediaLink article={article} />
      <StoryTitle article={article} heading="h3" className="sport-title--stack" />
      <StoryMeta article={article} showTopic={showTopic} />
    </article>
  );
}

function RailStory({
  article,
  showTopic,
}: {
  article: PublicArticle;
  showTopic: boolean;
}) {
  return (
    <article className="sport-rail-item">
      <StoryTitle article={article} heading="h3" className="sport-title--rail" />
      <StoryMeta article={article} showTopic={showTopic} />
    </article>
  );
}

function PromoStory({
  article,
  showTopic,
}: {
  article: PublicArticle;
  showTopic: boolean;
}) {
  return (
    <article className="sport-promo">
      <MediaLink article={article} />
      <StoryTitle article={article} heading="h3" className="sport-title--promo" />
      <StoryMeta article={article} showTopic={showTopic} />
    </article>
  );
}

export function CategoryStoryBoard({ articles }: { articles: PublicArticle[] }) {
  const [lead, ...rest] = articles;
  if (!lead) return null;

  const showTopic =
    new Set(articles.map((article) => article.category?.slug ?? article.media_type))
      .size > 1;

  let stack = rest.slice(0, Math.min(2, rest.length));
  let rail = rest.slice(stack.length, stack.length + 4);
  let after = rest.slice(stack.length + rail.length);
  if (after.length > 0 && after.length < 3) {
    rail = [...rail, ...after];
    after = [];
  }

  return (
    <div className="category-stories">
      <div
        className={cn(
          "sport-billboard",
          stack.length === 0 && rail.length === 0 && "sport-billboard--solo",
          rail.length === 0 && stack.length > 0 && "sport-billboard--no-rail",
          stack.length === 0 && rail.length > 0 && "sport-billboard--no-stack",
        )}
      >
        <LeadStory article={lead} showTopic={showTopic} />
        {stack.length > 0 ? (
          <div className="sport-stack-col">
            {stack.map((article) => (
              <StackStory key={article.id} article={article} showTopic={showTopic} />
            ))}
          </div>
        ) : null}
        {rail.length > 0 ? (
          <div className="sport-rail">
            {rail.map((article) => (
              <RailStory key={article.id} article={article} showTopic={showTopic} />
            ))}
          </div>
        ) : null}
      </div>
      {after.length > 0 ? (
        <div className="sport-promos">
          {after.map((article) => (
            <PromoStory key={article.id} article={article} showTopic={showTopic} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CategoryStorySkeleton() {
  return (
    <div className="category-stories" aria-hidden>
      <div className="sport-billboard">
        <div className="sport-lead">
          <div className="sport-media animate-pulse bg-muted" />
          <div className="mt-3 h-8 w-4/5 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-4 w-full animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-muted" />
        </div>
        <div className="sport-stack-col">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index}>
              <div className="sport-media animate-pulse bg-muted" />
              <div className="mt-2 h-5 w-4/5 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="sport-rail">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="sport-rail-item">
              <div className="h-5 w-full animate-pulse rounded bg-muted" />
              <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
