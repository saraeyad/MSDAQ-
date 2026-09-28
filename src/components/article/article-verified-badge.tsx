import { usePublicCopy } from "@/context/locale";
import { articlePassedEditorialVerification } from "@/lib/publishing";
import { cn } from "@/lib/utils";
import type { ArticleStatus } from "@/types";
import { useId } from "react";

interface ArticleVerifiedBadgeProps {
  article: {
    status?: ArticleStatus;
    published_at?: string | null;
  };
  className?: string;
  compact?: boolean;
}

function VerifiedSeal({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const fill = `verified-shield-${id}`;
  const rim = `verified-rim-${id}`;

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id={fill} x1="4" y1="2" x2="20" y2="22">
          <stop offset="0%" stopColor="#5cb860" />
          <stop offset="55%" stopColor="#2d8a38" />
          <stop offset="100%" stopColor="#1a5c22" />
        </linearGradient>
        <linearGradient id={rim} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${fill})`}
        d="M12 2.25 4.5 5.4v6.05c0 3.95 3.15 7.05 7.5 8.85 4.35-1.8 7.5-4.9 7.5-8.85V5.4L12 2.25Z"
      />
      <path
        fill={`url(#${rim})`}
        d="M12 2.25 4.5 5.4v6.05c0 3.95 3.15 7.05 7.5 8.85 4.35-1.8 7.5-4.9 7.5-8.85V5.4L12 2.25Z"
      />
      <path
        d="M8.35 12.1 10.75 14.5 15.85 9.15"
        fill="none"
        stroke="#fff"
        strokeWidth="2.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 2.25 4.5 5.4v6.05c0 3.95 3.15 7.05 7.5 8.85 4.35-1.8 7.5-4.9 7.5-8.85V5.4L12 2.25Z"
        fill="none"
        stroke="#1a5c22"
        strokeWidth="0.55"
        strokeOpacity="0.35"
      />
    </svg>
  );
}

export function ArticleVerifiedBadge({
  article,
  className,
  compact = false,
}: ArticleVerifiedBadgeProps) {
  const { article: articleCopy } = usePublicCopy();

  if (!articlePassedEditorialVerification(article)) return null;

  return (
    <span
      className={cn(
        "article-verified-badge",
        compact && "article-verified-badge--compact",
        className,
      )}
      title={articleCopy.verifiedTitle}
      aria-label={articleCopy.verifiedTitle}
    >
      <span className="article-verified-badge__seal" aria-hidden>
        <VerifiedSeal className="article-verified-badge__icon" />
      </span>
      <span className="article-verified-badge__label">
        {articleCopy.verifiedLabel}
      </span>
    </span>
  );
}
