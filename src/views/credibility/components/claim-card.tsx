import { cn } from "@/lib/utils";
import type { CredibilityClaim, ClaimVerdict } from "@/types/credibility";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const VERDICT_META: Record<
  ClaimVerdict,
  {
    icon: typeof CheckCircle2;
    colorClass: string;
    borderClass: string;
    badgeClass: string;
  }
> = {
  verified: {
    icon: CheckCircle2,
    colorClass: "text-trust-high",
    borderClass: "border-s-trust-high",
    badgeClass: "bg-trust-high/10 text-trust-high",
  },
  unverified: {
    icon: HelpCircle,
    colorClass: "text-muted-foreground",
    borderClass: "border-s-muted-foreground/40",
    badgeClass: "bg-muted text-muted-foreground",
  },
  disputed: {
    icon: AlertTriangle,
    colorClass: "text-trust-medium",
    borderClass: "border-s-trust-medium",
    badgeClass: "bg-trust-medium/10 text-trust-medium",
  },
  false: {
    icon: XCircle,
    colorClass: "text-trust-low",
    borderClass: "border-s-trust-low",
    badgeClass: "bg-trust-low/10 text-trust-low",
  },
};

interface ClaimCardProps {
  claim: CredibilityClaim;
  index: number;
}

export default function ClaimCard({ claim, index }: ClaimCardProps) {
  const { t } = useTranslation();
  const meta = VERDICT_META[claim.verdict];
  const Icon = meta.icon;

  return (
    <article
      className={cn(
        "rounded border border-border border-s-4 bg-card p-5 transition-colors hover:border-secondary/50",
        meta.borderClass,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="text-label-caps text-muted-foreground">
          {t("credibility.claimNumber", { number: index + 1 })}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
            meta.badgeClass,
          )}
        >
          <Icon className="size-3.5" />
          {t(`credibility.labels.${claim.verdict}`)}
        </span>
      </div>

      <p className="mt-4 text-body-md leading-relaxed text-foreground">{claim.text}</p>

      <p className="mt-4 rounded border border-border bg-muted/30 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
        {claim.explanation}
      </p>
    </article>
  );
}
