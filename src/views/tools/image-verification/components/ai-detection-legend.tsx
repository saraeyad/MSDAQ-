import { cn } from "@/lib/utils";
import type { AiImageVerdict } from "@/types/image-verification";
import { AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

const VERDICT_KEYS: AiImageVerdict[] = ["ai_generated", "likely_real", "uncertain"];

const VERDICT_META: Record<
  AiImageVerdict,
  {
    icon: typeof Sparkles;
    border: string;
    bg: string;
    text: string;
  }
> = {
  ai_generated: {
    icon: Sparkles,
    border: "border-s-trust-low",
    bg: "bg-trust-low/10",
    text: "text-trust-low",
  },
  likely_real: {
    icon: CheckCircle2,
    border: "border-s-trust-high",
    bg: "bg-trust-high/10",
    text: "text-trust-high",
  },
  uncertain: {
    icon: AlertTriangle,
    border: "border-s-trust-medium",
    bg: "bg-trust-medium/10",
    text: "text-trust-medium",
  },
};

export default function AiDetectionLegend() {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-border/70 bg-card/90 p-3 shadow-sm backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-accent-investigation">
        {t("imageVerification.ai.legend.title")}
      </p>
      <div className="mt-2.5 space-y-1.5">
        {VERDICT_KEYS.map((key) => {
          const { icon: Icon, border, bg, text } = VERDICT_META[key];
          return (
            <div
              key={key}
              className={cn(
                "flex items-start gap-2 rounded-md border border-border/50 border-s-2 bg-background/80 px-2 py-2",
                border,
              )}
            >
              <div className={cn("flex size-6 shrink-0 items-center justify-center rounded", bg, text)}>
                <Icon className="size-3" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold leading-tight text-foreground">
                  {t(`imageVerification.ai.legend.${key}.label`)}
                </p>
                <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
                  {t(`imageVerification.ai.legend.${key}.description`)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
