import { usePublicCopy } from "@/context/locale";
import type { PublicStaticCopy } from "@/lib/i18n/public-static-copy";
import { articlePassedEditorialVerification } from "@/lib/publishing";
import { cn } from "@/lib/utils";
import type { ArticleStatus, PublicMediaType } from "@/types";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ArticleVerifiedBadgeProps {
  article: {
    status?: ArticleStatus;
    published_at?: string | null;
    media_type?: PublicMediaType | string;
  };
  className?: string;
  compact?: boolean;
}

function verifiedTooltipCopy(
  articleCopy: PublicStaticCopy["article"],
  mediaType?: string,
) {
  if (mediaType === "audio") return articleCopy.verifiedTitleAudio;
  if (mediaType === "video") return articleCopy.verifiedTitleVideo;
  return articleCopy.verifiedTitleText;
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
  const tipId = useId();
  const badgeRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 268, arrow: 134 });
  const tooltip = verifiedTooltipCopy(articleCopy, article.media_type);

  const placeTip = useCallback(() => {
    const badge = badgeRef.current;
    if (!badge) return;
    const rect = badge.getBoundingClientRect();
    const width = Math.min(272, Math.max(196, window.innerWidth - 16));
    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
    let top = rect.bottom + 10;
    const estimatedHeight = 96;
    if (top + estimatedHeight > window.innerHeight - 8) {
      top = Math.max(8, rect.top - estimatedHeight - 10);
    }
    setCoords({
      top,
      left,
      width,
      arrow: rect.left + rect.width / 2 - left,
    });
  }, []);

  const show = () => {
    placeTip();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onMove = () => placeTip();
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [open, placeTip]);

  if (!articlePassedEditorialVerification(article)) return null;

  return (
    <span
      ref={badgeRef}
      className={cn(
        "article-verified-badge",
        compact && "article-verified-badge--compact",
        className,
      )}
      tabIndex={0}
      aria-label={tooltip}
      aria-describedby={open ? tipId : undefined}
      onMouseEnter={show}
      onMouseLeave={() => setOpen(false)}
      onFocus={show}
      onBlur={() => setOpen(false)}
    >
      <span className="article-verified-badge__shine" aria-hidden />
      <span className="article-verified-badge__seal" aria-hidden>
        <VerifiedSeal className="article-verified-badge__icon" />
      </span>
      <span className="article-verified-badge__label">
        {articleCopy.verifiedLabel}
      </span>
      {open && typeof document !== "undefined"
        ? createPortal(
            <span
              id={tipId}
              className="article-verified-badge__tip article-verified-badge__tip--open"
              role="tooltip"
              style={{
                top: coords.top,
                left: coords.left,
                width: coords.width,
                ["--tip-arrow" as string]: `${coords.arrow}px`,
              }}
            >
              {tooltip}
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
