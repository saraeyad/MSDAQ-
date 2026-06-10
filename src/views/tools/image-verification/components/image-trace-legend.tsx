import { LEGEND_ACCENT_CLASSES } from "@/lib/colors";
import { cn } from "@/lib/utils";
import { Building2, Clock, FileText, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

const LEGEND_KEYS = [
  {
    key: "appearances",
    icon: Globe,
    border: LEGEND_ACCENT_CLASSES.investigation.border,
    bg: LEGEND_ACCENT_CLASSES.investigation.bg,
    text: LEGEND_ACCENT_CLASSES.investigation.color,
  },
  {
    key: "domains",
    icon: Building2,
    border: "border-s-accent-investigation-ink",
    bg: "bg-accent-admin/10",
    text: "text-accent-admin",
  },
  {
    key: "context",
    icon: FileText,
    border: LEGEND_ACCENT_CLASSES.editorSecondary.border,
    bg: LEGEND_ACCENT_CLASSES.editorSecondary.bg,
    text: LEGEND_ACCENT_CLASSES.editorSecondary.color,
  },
  {
    key: "timeline",
    icon: Clock,
    border: LEGEND_ACCENT_CLASSES.chartRose.border,
    bg: LEGEND_ACCENT_CLASSES.chartRose.bg,
    text: LEGEND_ACCENT_CLASSES.chartRose.color,
  },
] as const;

export default function ImageTraceLegend() {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-border/70 bg-card/90 p-3 shadow-sm backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-accent-investigation">
        {t("imageVerification.legend.title")}
      </p>
      <div className="mt-2.5 space-y-1.5">
        {LEGEND_KEYS.map(({ key, icon: Icon, border, bg, text }) => (
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
                {t(`imageVerification.legend.${key}.label`)}
              </p>
              <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
                {t(`imageVerification.legend.${key}.description`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
