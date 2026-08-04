import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const SIZE_CLASS = {
  sm: "size-4",
  md: "size-8",
  lg: "size-10",
} as const;

interface LoadingSpinnerProps {
  className?: string;
  size?: keyof typeof SIZE_CLASS;
  label?: string;
}

export function LoadingSpinner({
  className,
  size = "md",
  label = "جاري التحميل",
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn("flex items-center justify-center", className)}
      role="status"
      aria-label={label}
    >
      <Loader2
        className={cn(SIZE_CLASS[size], "animate-spin text-primary")}
        aria-hidden
      />
    </div>
  );
}

export function PageLoading({ className }: { className?: string }) {
  return <LoadingSpinner className={cn("py-10", className)} size="md" />;
}
