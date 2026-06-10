import { LEGEND_ACCENT_CLASSES } from "@/lib/colors";
import { cn } from "@/lib/utils";
import {
  AlignLeft,
  BookOpen,
  FileText,
  Languages,
  Scale,
  Shield,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const CRITERIA_KEYS = [
  "fusha_language",
  "headline_neutral",
  "claims_sourced",
  "no_bias",
  "five_ws",
  "opinion_separated",
  "multiple_sides",
] as const;

type CriterionKey = (typeof CRITERIA_KEYS)[number];

const CRITERION_META: Record<
  CriterionKey,
  {
    icon: typeof Languages;
    colorClass: string;
    bgClass: string;
    borderClass: string;
  }
> = {
  fusha_language: {
    icon: Languages,
    colorClass: "text-trust-high",
    bgClass: "bg-trust-high/10",
    borderClass: "border-s-trust-high",
  },
  headline_neutral: {
    icon: AlignLeft,
    colorClass: "text-secondary",
    bgClass: "bg-secondary/10",
    borderClass: "border-s-secondary",
  },
  claims_sourced: {
    icon: FileText,
    colorClass: LEGEND_ACCENT_CLASSES.editor.color,
    bgClass: LEGEND_ACCENT_CLASSES.editor.bg,
    borderClass: LEGEND_ACCENT_CLASSES.editor.border,
  },
  no_bias: {
    icon: Scale,
    colorClass: "text-trust-medium",
    bgClass: "bg-trust-medium/10",
    borderClass: "border-s-trust-medium",
  },
  five_ws: {
    icon: BookOpen,
    colorClass: LEGEND_ACCENT_CLASSES.editorSecondary.color,
    bgClass: LEGEND_ACCENT_CLASSES.editorSecondary.bg,
    borderClass: LEGEND_ACCENT_CLASSES.editorSecondary.border,
  },
  opinion_separated: {
    icon: Shield,
    colorClass: LEGEND_ACCENT_CLASSES.editor.color,
    bgClass: LEGEND_ACCENT_CLASSES.editor.bg,
    borderClass: LEGEND_ACCENT_CLASSES.editor.border,
  },
  multiple_sides: {
    icon: Users,
    colorClass: LEGEND_ACCENT_CLASSES.chartRose.color,
    bgClass: LEGEND_ACCENT_CLASSES.chartRose.bg,
    borderClass: LEGEND_ACCENT_CLASSES.chartRose.border,
  },
};

export default function StandardsCriteriaLegend() {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-border/70 bg-card/90 p-3 shadow-sm backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-secondary">
        {t("smartEditor.legend.title")}
      </p>
      <div className="mt-2.5 space-y-1.5">
        {CRITERIA_KEYS.map((key) => {
          const { icon: Icon, colorClass, bgClass, borderClass } = CRITERION_META[key];
          return (
            <div
              key={key}
              className={cn(
                "flex items-start gap-2 rounded-md border border-border/50 border-s-2 bg-background/80 px-2 py-2",
                borderClass,
              )}
            >
              <div
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded",
                  bgClass,
                  colorClass,
                )}
              >
                <Icon className="size-3" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold leading-tight text-foreground">
                  {t(`smartEditor.criteria.${key}`)}
                </p>
                <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
                  {t(`smartEditor.legend.${key}`)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { CRITERIA_KEYS, CRITERION_META };
export type { CriterionKey };
