import {
  AnimatedStagger,
  AnimatedStaggerItem,
} from "@/components/animated-stagger";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ImageVerificationResult } from "@/types/image-verification";
import { AnimatePresence, motion } from "framer-motion";
import { ImageOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import AppearanceCard from "./appearance-card";
import ImageRadarLoading from "./image-radar-loading";
import LeadAppearanceCard from "./lead-appearance-card";
import TraceSummaryHeader from "./trace-summary-header";

interface ImageVerificationResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  result: ImageVerificationResult | null;
  previewUrl: string | null;
}

export default function ImageVerificationResultsModal({
  open,
  onOpenChange,
  loading,
  result,
  previewUrl,
}: ImageVerificationResultsModalProps) {
  const { t } = useTranslation();

  const loadingSteps = [
    t("imageVerification.loading.steps.scanning"),
    t("imageVerification.loading.steps.tracing"),
    t("imageVerification.loading.steps.mapping"),
    t("imageVerification.loading.steps.assembling"),
  ];

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && loading) return;
    onOpenChange(nextOpen);
  };

  const leadAppearance = result?.appearances[0];
  const restAppearances = result?.appearances.slice(1) ?? [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl",
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
                title={t("imageVerification.loading.title")}
                hint={t("imageVerification.loading.hint")}
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
              <TraceSummaryHeader result={result} />

              <div className="relative min-h-0 flex-1 overflow-y-auto px-6 py-5">
                {result.appearances.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <ImageOff className="mb-4 size-12 text-muted-foreground/40" />
                    <p className="text-base font-medium text-foreground">
                      {t("imageVerification.empty.title")}
                    </p>
                    <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                      {t("imageVerification.empty.description")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {leadAppearance ? (
                      <LeadAppearanceCard appearance={leadAppearance} />
                    ) : null}

                    {restAppearances.length > 0 ? (
                      <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          {t("imageVerification.moreAppearances")}
                        </h3>
                        <AnimatedStagger className="grid gap-4 sm:grid-cols-2">
                          {restAppearances.map((appearance) => (
                            <AnimatedStaggerItem key={`${appearance.link}-${appearance.title}`}>
                              <AppearanceCard appearance={appearance} />
                            </AnimatedStaggerItem>
                          ))}
                        </AnimatedStagger>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
