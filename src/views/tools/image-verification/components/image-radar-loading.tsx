import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ImageRadarLoadingProps {
  imageUrl: string;
  title: string;
  hint: string;
  steps: string[];
}

export default function ImageRadarLoading({
  imageUrl,
  title,
  hint,
  steps,
}: ImageRadarLoadingProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((current) => (current + 1) % steps.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="flex min-h-[380px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="relative mb-8 flex size-36 items-center justify-center">
        {[0, 1, 2].map((ring) => (
          <motion.span
            key={ring}
            className="absolute inset-0 rounded-full border-2 border-[var(--investigation-amber)]/30"
            animate={{ scale: [0.85, 1.35], opacity: [0.5, 0] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeOut",
              delay: ring * 0.5,
            }}
          />
        ))}

        <motion.div
          layoutId="source-image"
          className="relative z-10 size-28 overflow-hidden rounded-xl border-2 border-[var(--investigation-amber)]/40 shadow-lg"
        >
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          <motion.div
            className="absolute inset-x-0 h-0.5 bg-[var(--investigation-amber)] shadow-[0_0_12px_var(--investigation-amber)]"
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </div>

      <motion.h3
        className="text-headline-sm text-foreground"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
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

      <p className="mt-4 max-w-sm text-xs leading-relaxed text-muted-foreground/80">{hint}</p>

      <div className="mt-8 flex items-center gap-2">
        {steps.map((_, index) => (
          <span
            key={index}
            className={cn(
              "h-1.5 rounded-full transition-all",
              index === stepIndex
                ? "w-6 bg-[var(--investigation-amber)]"
                : "w-1.5 bg-[var(--investigation-amber)]/25",
            )}
          />
        ))}
      </div>
    </div>
  );
}
