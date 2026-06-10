import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface AiAnalysisLoadingProps {
  title: string;
  hint: string;
  steps: string[];
  className?: string;
}

export default function AiAnalysisLoading({
  title,
  hint,
  steps,
  className,
}: AiAnalysisLoadingProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((current) => (current + 1) % steps.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div
      className={cn(
        "flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center",
        className,
      )}
    >
      <div className="relative mb-8 flex size-24 items-center justify-center">
        <motion.span
          className="absolute inset-0 rounded-full bg-secondary/10"
          animate={{ scale: [1, 1.18, 1], opacity: [0.45, 0.15, 0.45] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          className="absolute inset-3 rounded-full bg-secondary/15"
          animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.25, 0.55] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.35 }}
        />
        <motion.div
          className="relative flex size-16 items-center justify-center rounded-full border border-secondary/25 bg-gradient-to-br from-secondary/15 to-accent-editor/10 shadow-sm"
          animate={{ rotate: [0, 4, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="size-7 text-secondary" />
        </motion.div>
      </div>

      <motion.h3
        className="text-headline-sm text-foreground"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        {title}
      </motion.h3>

      <div className="mt-3 h-8">
        <AnimatePresence mode="wait">
          <motion.p
            key={stepIndex}
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            {steps[stepIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      <p className="mt-4 max-w-sm text-xs leading-relaxed text-muted-foreground/80">
        {hint}
      </p>

      <div className="mt-8 flex items-center gap-2">
        {steps.map((_, index) => (
          <motion.span
            key={index}
            className={cn(
              "h-1.5 rounded-full transition-all",
              index === stepIndex ? "w-6 bg-secondary" : "w-1.5 bg-secondary/25",
            )}
            animate={index === stepIndex ? { opacity: [0.55, 1, 0.55] } : { opacity: 0.45 }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
        ))}
      </div>
    </div>
  );
}
