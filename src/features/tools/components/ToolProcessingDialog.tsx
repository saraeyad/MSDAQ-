import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export const DEFAULT_TOOL_PROCESSING_STEPS = [
  "جاري تحليل المدخلات...",
  "جاري المعالجة...",
  "جاري إعداد النتيجة...",
] as const;

interface ToolProcessingDialogProps {
  open: boolean;
  title: string;
  description?: string;
  steps?: readonly string[];
}

export function ToolProcessingDialog({
  open,
  title,
  description = "قد تستغرق العملية بضع ثوانٍ — يُرجى الانتظار وعدم إغلاق الصفحة.",
  steps = DEFAULT_TOOL_PROCESSING_STEPS,
}: ToolProcessingDialogProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!open) {
      setStepIndex(0);
      setElapsed(0);
      return;
    }

    const stepTimer = window.setInterval(() => {
      setStepIndex((current) => (current + 1) % steps.length);
    }, 2800);

    const elapsedTimer = window.setInterval(() => {
      setElapsed((current) => current + 1);
    }, 1000);

    return () => {
      window.clearInterval(stepTimer);
      window.clearInterval(elapsedTimer);
    };
  }, [open, steps]);

  const activeStep = steps[stepIndex] ?? steps[0] ?? "";

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md [&>button]:hidden"
        onPointerDownOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
        aria-describedby="tool-processing-description"
      >
        <DialogHeader className="items-center text-center sm:items-center sm:text-center">
          <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="size-7 animate-spin text-primary" aria-hidden />
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription id="tool-processing-description">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="tool-processing-bar h-full w-1/3 rounded-full bg-primary" />
          </div>

          <p
            key={activeStep}
            className={cn(
              "min-h-[1.25rem] text-center text-sm font-medium text-foreground",
              "animate-in fade-in slide-in-from-bottom-1 duration-300",
            )}
          >
            {activeStep}
          </p>

          <p className="text-center text-xs text-muted-foreground">
            {elapsed > 0 ? `الوقت المنقضي: ${elapsed} ث` : "بدء المعالجة..."}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Wrap an async tool call — opens/closes processing state automatically. */
export async function runWithToolProcessing<T>(
  setProcessing: (open: boolean) => void,
  task: () => Promise<T>,
): Promise<T> {
  setProcessing(true);
  try {
    return await task();
  } finally {
    setProcessing(false);
  }
}
