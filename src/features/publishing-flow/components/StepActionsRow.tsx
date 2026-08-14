import { PrevStepButton } from "@/features/publishing-flow/components/PrevStepButton";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StepActionsRowProps {
  children?: ReactNode;
  className?: string;
  onBack?: () => void;
}

/** Footer row for step navigation — previous at the start, next at the end. */
export function StepActionsRow({
  children,
  className,
  onBack,
}: StepActionsRowProps) {
  return (
    <div
      className={cn(
        "mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-4",
        onBack ? "justify-between" : "justify-end",
        className,
      )}
    >
      {onBack ? <PrevStepButton onClick={onBack} /> : null}
      {children ? (
        <div className="flex flex-wrap items-center gap-3">{children}</div>
      ) : null}
    </div>
  );
}
