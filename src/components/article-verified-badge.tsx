import { articlePassedEditorialVerification } from "@/lib/publish-gate";
import { cn } from "@/lib/utils";
import type { ArticleVerification } from "@/types";
import { useId } from "react";

interface ArticleVerifiedBadgeProps {
  article: { verification?: ArticleVerification | null };
  className?: string;
  compact?: boolean;
}

function VerifiedSeal({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const fill = `verified-fill-${id}`;
  const shine = `verified-shine-${id}`;

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id={fill} x1="7" y1="2" x2="17" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3ee07a" />
          <stop offset="42%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#0f7a36" />
        </linearGradient>
        <linearGradient id={shine} x1="12" y1="2" x2="12" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12.4" r="10.2" fill="#0b5c28" opacity="0.28" />
      <circle cx="12" cy="12" r="10.2" fill={`url(#${fill})`} />
      <circle
        cx="12"
        cy="12"
        r="9.35"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.35"
        strokeWidth="1.15"
      />
      <ellipse cx="12" cy="7.2" rx="6.2" ry="3.4" fill={`url(#${shine})`} />
      <path
        d="M7.35 12.15 10.4 15.2 16.7 8.6"
        fill="none"
        stroke="#fff"
        strokeWidth="2.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArticleVerifiedBadge({
  article,
  className,
  compact = false,
}: ArticleVerifiedBadgeProps) {
  if (!articlePassedEditorialVerification(article)) return null;

  return (
    <span
      className={cn(
        "article-verified-badge",
        compact && "article-verified-badge--compact",
        className,
      )}
      title="تم فحص المصداقية"
    >
      <VerifiedSeal className="article-verified-badge__icon" />
      {compact ? (
        <span className="sr-only">موثّق</span>
      ) : (
        <span className="article-verified-badge__label">موثّق</span>
      )}
    </span>
  );
}
