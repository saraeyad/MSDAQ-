import { cn } from "@/lib/utils";
import { PUBLIC_TOOLS } from "@/lib/tool-config";
import type { PublicToolId } from "@/lib/tool-config";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const HEADLINE_VERB_FONT: Record<PublicToolId, string> = {
  credibility: "showcase-verb-font-investigate",
  smartEditor: "showcase-verb-font-verify",
  imageTrace: "showcase-verb-font-trace",
};

interface ShowcaseHeadlineProps {
  activeStep: number;
  onStepChange: (step: number) => void;
}

export default function ShowcaseHeadline({ activeStep, onStepChange }: ShowcaseHeadlineProps) {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % PUBLIC_TOOLS.length;
        onStepChange(PUBLIC_TOOLS[next].step);
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [onStepChange]);

  useEffect(() => {
    setActiveIndex(activeStep - 1);
  }, [activeStep]);

  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-label-caps text-secondary">{t("home.showcase.tagline")}</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
        {PUBLIC_TOOLS.map((tool, index) => (
          <span key={tool.id} className="inline-flex items-center gap-3">
            <motion.span
              className={cn(
                "showcase-headline-verb font-normal transition-colors duration-500",
                HEADLINE_VERB_FONT[tool.id],
                activeIndex === index
                  ? cn("showcase-headline-verb-active", tool.accent.text)
                  : "text-muted-foreground/40",
              )}
              animate={{
                scale: activeIndex === index ? 1.08 : 0.94,
                y: activeIndex === index ? 0 : 2,
              }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              {t(tool.i18n.workflowVerb)}
            </motion.span>
            {index < PUBLIC_TOOLS.length - 1 ? (
              <span className="text-muted-foreground/30">·</span>
            ) : null}
          </span>
        ))}
      </div>
      <p className="mt-3 text-body-md text-muted-foreground">{t("home.showcase.subtitle")}</p>
    </div>
  );
}
