import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StepActionsRowProps {
  children: ReactNode;
  className?: string;
}

/** Footer row for step navigation — actions align to the visual left in RTL. */
export function StepActionsRow({ children, className }: StepActionsRowProps) {
  return (
    <div
      className={cn(
        "mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
