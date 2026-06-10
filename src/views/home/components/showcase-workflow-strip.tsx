import { cn } from "@/lib/utils";
import { PUBLIC_TOOLS } from "@/lib/tool-config";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface ShowcaseWorkflowStripProps {
  activeStep: number;
}

export default function ShowcaseWorkflowStrip({ activeStep }: ShowcaseWorkflowStripProps) {
  const { t } = useTranslation();

  return (
    <div className="relative mx-auto hidden max-w-4xl px-4 lg:block">
      <svg
        viewBox="0 0 800 60"
        className="h-14 w-full"
        aria-hidden
      >
        <motion.path
          d="M 60 30 L 400 30 L 740 30"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="6 8"
          className="text-border"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        {PUBLIC_TOOLS.map((tool, index) => {
          const x = index === 0 ? 60 : index === 1 ? 400 : 740;
          const isActive = tool.step === activeStep;
          return (
            <g key={tool.id}>
              <motion.circle
                cx={x}
                cy={30}
                r={isActive ? 10 : 7}
                className={cn(
                  "transition-colors",
                  isActive ? tool.accent.text : "text-muted-foreground/40",
                )}
                fill="currentColor"
                animate={{ scale: isActive ? [1, 1.15, 1] : 1 }}
                transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
              />
            </g>
          );
        })}
      </svg>

      <div className="mt-2 grid grid-cols-3 gap-4 text-center">
        {PUBLIC_TOOLS.map((tool) => {
          const isActive = tool.step === activeStep;
          return (
            <div key={tool.id} className="space-y-1">
              <p
                className={cn(
                  "text-xs font-semibold uppercase tracking-wider transition-colors",
                  isActive ? tool.accent.text : "text-muted-foreground/50",
                )}
              >
                {String(tool.step).padStart(2, "0")} · {t(tool.i18n.workflowVerb)}
              </p>
              <p className="text-[11px] text-muted-foreground">{t(tool.i18n.workflowLabel)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
