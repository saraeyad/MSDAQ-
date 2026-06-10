import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { AiDetectionResult, AiImageVerdict } from "@/types/image-verification";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import ImageRadarLoading from "./image-radar-loading";

const VERDICT_META: Record<
  AiImageVerdict,
  {
    icon: typeof Sparkles;
    badgeClass: string;
    textClass: string;
  }
> = {
  ai_generated: {
    icon: Sparkles,
    badgeClass: "bg-trust-low text-white",
    textClass: "text-trust-low",
  },
  likely_real: {
    icon: CheckCircle2,
    badgeClass: "bg-trust-high text-white",
    textClass: "text-trust-high",
  },
  uncertain: {
    icon: AlertTriangle,
    badgeClass: "bg-trust-medium text-white",
    textClass: "text-trust-medium",
  },
};

interface AiDetectionResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  result: AiDetectionResult | null;
  previewUrl: string | null;
}

export default function AiDetectionResultsModal({
  open,
  onOpenChange,
  loading,
  result,
  previewUrl,
}: AiDetectionResultsModalProps) {
  const { t } = useTranslation();

  const loadingSteps = [
    t("imageVerification.ai.loading.steps.uploading"),
    t("imageVerification.ai.loading.steps.scanning"),
    t("imageVerification.ai.loading.steps.scoring"),
    t("imageVerification.ai.loading.steps.finalizing"),
  ];

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && loading) return;
    onOpenChange(nextOpen);
  };

  const verdictMeta = result ? VERDICT_META[result.verdict] : null;
  const VerdictIcon = verdictMeta?.icon ?? Sparkles;
  const confidencePercent = result
    ? Math.round(result.confidenceScore * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg",
          loading && "[&>button]:hidden",
        )}
        onEscapeKeyDown={(event) => loading && event.preventDefault()}
        onPointerDownOutside={(event) => loading && event.preventDefault()}
      >
        <AnimatePresence mode="wait">
          {loading && previewUrl ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ImageRadarLoading
                imageUrl={previewUrl}
                title={t("imageVerification.ai.loading.title")}
                hint={t("imageVerification.ai.loading.hint")}
                steps={loadingSteps}
              />
            </motion.div>
          ) : result ? (
            <motion.div
              key="results"
              className="flex flex-col gap-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader className="border-b border-border/60 px-6 py-4">
                <DialogTitle>{t("imageVerification.ai.resultsTitle")}</DialogTitle>
              </DialogHeader>

              <div className="space-y-5 px-6 py-5">
                {previewUrl ? (
                  <div className="overflow-hidden rounded-lg border border-border/70 bg-muted/30">
                    <img
                      src={previewUrl}
                      alt=""
                      className="mx-auto max-h-48 w-full object-contain"
                    />
                  </div>
                ) : null}

                <div className="flex flex-col items-center gap-3 text-center">
                  <span
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold",
                      verdictMeta?.badgeClass,
                    )}
                  >
                    <VerdictIcon className="size-4" />
                    {t(`imageVerification.ai.verdict.${result.verdict}`)}
                  </span>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(`imageVerification.ai.verdictDescription.${result.verdict}`)}
                  </p>
                </div>

                <div className="rounded-lg border border-border/70 bg-card/80 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("imageVerification.ai.confidence")}
                    </span>
                    <span className={cn("font-semibold tabular-nums", verdictMeta?.textClass)}>
                      {confidencePercent}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full transition-all", verdictMeta?.badgeClass)}
                      style={{ width: `${confidencePercent}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {result.likelyAiGenerated
                      ? t("imageVerification.ai.likelyAiGenerated")
                      : t("imageVerification.ai.likelyReal")}
                    {" · "}
                    {t("imageVerification.ai.status")}: {result.status}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
