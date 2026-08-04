import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { ComponentProps } from "react";

export const NEXT_STEP_LABEL = "انتقل للخطوة التالية";

interface NextStepButtonProps extends ComponentProps<typeof Button> {
  loading?: boolean;
}

export function NextStepButton({
  loading,
  disabled,
  children,
  className,
  ...props
}: NextStepButtonProps) {
  return (
    <Button
      variant="outline"
      disabled={disabled || loading}
      className={cn("gap-2 border-primary/30 text-primary hover:bg-primary/5", className)}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children ?? NEXT_STEP_LABEL}
      {!loading && <ArrowLeft className="size-4" aria-hidden />}
    </Button>
  );
}
