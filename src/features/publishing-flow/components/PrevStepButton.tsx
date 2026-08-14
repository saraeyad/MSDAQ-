import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import type { ComponentProps } from "react";

export const PREV_STEP_LABEL = "انتقل للخطوة السابقة";

export function PrevStepButton({
  children,
  className,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn("gap-2", className)}
      {...props}
    >
      <ArrowRight className="size-4" aria-hidden />
      {children ?? PREV_STEP_LABEL}
    </Button>
  );
}
