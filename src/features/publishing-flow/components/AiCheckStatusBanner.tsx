import type { AiCheck } from "@/types";
import { Loader2 } from "lucide-react";

interface AiCheckStatusBannerProps {
  check: AiCheck | null;
  inProgressLabel?: string;
}

export function AiCheckStatusBanner({
  check,
  inProgressLabel = "جاري الفحص…",
}: AiCheckStatusBannerProps) {
  if (!check) return null;

  if (check.status === "queued" || check.status === "running") {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
        {inProgressLabel}
      </p>
    );
  }

  if (check.status === "failed") {
    return (
      <p className="text-sm text-destructive" role="alert">
        {check.error_message?.trim() || "فشل الفحص. يمكنك إعادة المحاولة."}
      </p>
    );
  }

  return null;
}
