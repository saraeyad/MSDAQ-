import AiAnalysisLoading from "@/components/ai-analysis-loading";
import {
  AnimatedStagger,
  AnimatedStaggerItem,
  fadeUpVariants,
} from "@/components/animated-stagger";
import ScoreRing from "@/components/score-ring";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ClaimVerdict, CredibilityCheckResult } from "@/types/credibility";
import { AnimatePresence, motion } from "framer-motion";
import { Clock3 } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ClaimCard from "./claim-card";

interface CredibilityResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  result: CredibilityCheckResult | null;
  checkedAt: string | null;
}

export default function CredibilityResultsModal({
  open,
  onOpenChange,
  loading,
  result,
  checkedAt,
}: CredibilityResultsModalProps) {
  const { t } = useTranslation();

  const loadingSteps = [
    t("aiAnalysis.credibility.steps.reading"),
    t("aiAnalysis.credibility.steps.extracting"),
    t("aiAnalysis.credibility.steps.verifying"),
    t("aiAnalysis.credibility.steps.report"),
  ];

  const verdictCounts = useMemo(() => {
    if (!result) return null;
    const counts: Record<ClaimVerdict, number> = {
      verified: 0,
      unverified: 0,
      disputed: 0,
      false: 0,
    };
    for (const claim of result.claims) {
      counts[claim.verdict] += 1;
    }
    return counts;
  }, [result]);

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
                title={t("aiAnalysis.credibility.title")}
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
              <DialogHeader className="shrink-0 border-b border-border bg-gradient-to-br from-[#eef2ff] via-white to-[#f0fdf4] px-6 py-5">
                <motion.div
                  className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="show"
                >
                  <div className="space-y-2 text-start">
                    <DialogTitle>{t("credibility.resultsTitle")}</DialogTitle>
                    {formattedDate ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock3 className="size-4" />
                        <span>{t("credibility.checkedAtPrefix")}</span>
                        <span>{formattedDate}</span>
                      </div>
                    ) : null}
                    <p className="text-sm text-muted-foreground">
                      {t("credibility.claimsSubtitle", { count: result.totalClaims })}
                    </p>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ScoreRing
                      score={result.credibilityScore}
                      size="lg"
                      label={t("credibility.overallScore")}
                      animated
                      className="mx-auto sm:mx-0"
                    />
                  </motion.div>
                </motion.div>

                {verdictCounts ? (
                  <AnimatedStagger className="mt-4 flex flex-wrap gap-2">
                    {(["verified", "unverified", "disputed", "false"] as ClaimVerdict[]).map(
                      (verdict) =>
                        verdictCounts[verdict] > 0 ? (
                          <AnimatedStaggerItem key={verdict}>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium">
                              <span className="font-semibold text-foreground">
                                {verdictCounts[verdict]}
                              </span>
                              <span className="text-muted-foreground">
                                {t(`credibility.labels.${verdict}`)}
                              </span>
                            </span>
                          </AnimatedStaggerItem>
                        ) : null,
                    )}
                  </AnimatedStagger>
                ) : null}
              </DialogHeader>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <motion.h3
                  className="mb-4 text-base font-semibold"
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="show"
                >
                  {t("credibility.claimsTitle")}
                </motion.h3>
                <AnimatedStagger className="space-y-4">
                  {result.claims.map((claim, index) => (
                    <AnimatedStaggerItem key={`${claim.text}-${index}`}>
                      <ClaimCard claim={claim} index={index} />
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
