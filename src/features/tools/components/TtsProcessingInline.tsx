import { Button } from "@/components/ui/button";
import type { TtsPollUiState } from "@/hooks/publishing";
import { Loader2 } from "lucide-react";

function formatProgress(state: Extract<TtsPollUiState, { kind: "processing" }>): string {
  const status = state.pollStatus;
  if (!status || status.chunks_total == null) {
    return "في الانتظار…";
  }
  if (status.progress_percent != null && Number.isFinite(status.progress_percent)) {
    return `جاري التوليد… ${Math.round(status.progress_percent)}%`;
  }
  return `جاري التوليد ${status.chunks_done} من ${status.chunks_total}…`;
}

interface TtsProcessingInlineProps {
  state: TtsPollUiState;
  onRecheck?: () => void;
  rechecking?: boolean;
}

export function TtsProcessingInline({
  state,
  onRecheck,
  rechecking = false,
}: TtsProcessingInlineProps) {
  if (state.kind === "idle" || state.kind === "completed") {
    return null;
  }

  if (state.kind === "processing") {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        {formatProgress(state)}
      </p>
    );
  }

  if (state.kind === "timed_out") {
    return (
      <div className="space-y-2 text-sm">
        <p className="text-amber-800 dark:text-amber-200">
          يستغرق أكثر من المعتاد — قد يكون التوليد ما زال قيد التنفيذ.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRecheck}
          disabled={rechecking}
        >
          {rechecking && <Loader2 className="size-4 animate-spin" />}
          تحقق مرة أخرى
        </Button>
      </div>
    );
  }

  return (
    <p className="text-sm text-destructive">
      {state.errorMessage?.trim() || "فشل تحويل النص إلى صوت"}
    </p>
  );
}
