import { cn } from "@/lib/utils";
import type { ClaimVerdict } from "@/types/credibility";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const VERDICTS: ClaimVerdict[] = ["verified", "unverified", "disputed", "false"];

const VERDICT_META: Record<
  ClaimVerdict,
  {
    icon: typeof CheckCircle2;
    colorClass: string;
    bgClass: string;
    borderClass: string;
  }
> = {
  verified: {
    icon: CheckCircle2,
    colorClass: "text-trust-high",
    bgClass: "bg-trust-high/10",
    borderClass: "border-s-trust-high",
  },
  unverified: {
    icon: HelpCircle,
    colorClass: "text-muted-foreground",
    bgClass: "bg-muted",
    borderClass: "border-s-muted-foreground/40",
  },
  disputed: {
    icon: AlertTriangle,
    colorClass: "text-trust-medium",
    bgClass: "bg-trust-medium/10",
    borderClass: "border-s-trust-medium",
  },
  false: {
    icon: XCircle,
    colorClass: "text-trust-low",
    bgClass: "bg-trust-low/10",
    borderClass: "border-s-trust-low",
  },
};

interface VerdictLegendProps {
  variant?: "sidebar" | "grid";
}

export default function VerdictLegend({ variant = "sidebar" }: VerdictLegendProps) {
  const { t } = useTranslation();
  const isSidebar = variant === "sidebar";

  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-card/90 shadow-sm backdrop-blur-sm",
        isSidebar ? "p-3" : "p-5 md:p-6",
      )}
    >
      <p
        className={cn(
          "text-secondary",
          isSidebar
            ? "text-[11px] font-semibold uppercase tracking-wider"
            : "text-label-caps",
        )}
      >
        {t("credibility.legend.title")}
      </p>
      <div
        className={cn(
          isSidebar ? "mt-2.5 space-y-1.5" : "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
        )}
      >
        {VERDICTS.map((verdict) => {
          const { icon: Icon, colorClass, bgClass, borderClass } = VERDICT_META[verdict];
          return (
            <div
              key={verdict}
              className={cn(
                "flex items-start gap-2 rounded-md border border-border/50 bg-background/80",
                isSidebar
                  ? cn("border-s-2 px-2 py-2", borderClass)
                  : "gap-3 p-4",
              )}
            >
              <div
                className={cn(
                  "flex shrink-0 items-center justify-center rounded",
                  isSidebar ? "size-6" : "size-9",
                  bgClass,
                  colorClass,
                )}
              >
                <Icon className={isSidebar ? "size-3" : "size-4"} />
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    "font-semibold text-foreground",
                    isSidebar ? "text-xs leading-tight" : "text-sm",
                  )}
                >
                  {t(`credibility.labels.${verdict}`)}
                </p>
                <p
                  className={cn(
                    "text-muted-foreground",
                    isSidebar
                      ? "mt-0.5 text-[10px] leading-snug"
                      : "mt-1 text-xs leading-relaxed",
                  )}
                >
                  {t(`credibility.legend.${verdict}`)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
