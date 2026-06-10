import AiAnalysisLoading from "@/components/ai-analysis-loading";
import {
  AnimatedStagger,
  AnimatedStaggerItem,
  fadeUpVariants,
} from "@/components/animated-stagger";
import ScoreRing from "@/components/score-ring";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { StandardsCheckResult } from "@/types/journalist-article";
import { AnimatePresence, motion } from "framer-motion";
import { Clock3, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import CriterionCard from "./criterion-card";

interface StandardsResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  result: StandardsCheckResult | null;
  checkedAt: string | null;
}

export default function StandardsResultsModal({
  open,
  onOpenChange,
  loading,
  result,
  checkedAt,
}: StandardsResultsModalProps) {
  const { t } = useTranslation();

  const loadingSteps = [
    t("aiAnalysis.standards.steps.reading"),
    t("aiAnalysis.standards.steps.fusha"),
    t("aiAnalysis.standards.steps.scoring"),
    t("aiAnalysis.standards.steps.report"),
  ];

  const formattedDate = checkedAt ? new Date(checkedAt).toLocaleString() : null;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && loading) return;
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl",
          loading && "[&>button]:hidden",
        )}
        onEscapeKeyDown={(event) => loading && event.preventDefault()}
        onPointerDownOutside={(event) => loading && event.preventDefault()}
      >
        <AnimatePresence mode="wait">
          {loading && !result ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AiAnalysisLoading
                title={t("aiAnalysis.standards.title")}
                hint={t("aiAnalysis.hint")}
                steps={loadingSteps}
              />
            </motion.div>
          ) : result ? (
            <motion.div
              key="results"
              className="flex min-h-0 flex-1 flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45 }}
            >
              <DialogHeader className="shrink-0 border-b border-border bg-gradient-to-br from-[#eef2ff] via-white to-[#f0fdfa] px-6 py-5">
                <motion.div
                  className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="show"
                >
                  <div className="space-y-2 text-start">
                    <DialogTitle className="flex items-center gap-2">
                      <ShieldCheck className="size-5 text-secondary" />
                      {t("smartEditor.resultsTitle")}
                    </DialogTitle>
                    {formattedDate ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock3 className="size-4" />
                        <span>{t("smartEditor.checkedAtPrefix")}</span>
                        <span>{formattedDate}</span>
                      </div>
                    ) : null}
                    <p className="text-sm text-muted-foreground">
                      {t("smartEditor.resultsSubtitle", { score: result.trustScore })}
                    </p>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ScoreRing
                      score={result.trustScore}
                      size="lg"
                      label={t("scores.trust")}
                      animated
                      className="mx-auto sm:mx-0"
                    />
                  </motion.div>
                </motion.div>

                <AnimatedStagger className="mt-4 flex flex-wrap gap-2">
                  <AnimatedStaggerItem>
                    <Badge variant={result.fushaCompliant ? "success" : "destructive"}>
                      {result.fushaCompliant
                        ? t("journalist.editor.fushaOk")
                        : t("journalist.editor.fushaRequired")}
                    </Badge>
                  </AnimatedStaggerItem>
                  <AnimatedStaggerItem>
                    <Badge variant={result.canPublish ? "default" : "secondary"}>
                      {result.canPublish
                        ? t("journalist.editor.canPublish")
                        : t("journalist.editor.cannotPublish")}
                    </Badge>
                  </AnimatedStaggerItem>
                </AnimatedStagger>
              </DialogHeader>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <motion.h3
                  className="mb-4 text-base font-semibold"
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="show"
                >
                  {t("smartEditor.breakdownTitle")}
                </motion.h3>
                <AnimatedStagger className="space-y-3">
                  {result.breakdown.map((item) => (
                    <AnimatedStaggerItem key={item.key}>
                      <CriterionCard item={item} />
                    </AnimatedStaggerItem>
                  ))}
                </AnimatedStagger>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
