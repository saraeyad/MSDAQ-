import { Button } from "@/components/ui/button";
import type { TranscriptPollUiState } from "@/hooks/useTranscriptStatusPoll";
import { Loader2 } from "lucide-react";

interface TranscriptProcessingInlineProps {
  state: TranscriptPollUiState;
  onRecheck?: () => void;
  rechecking?: boolean;
}

export function TranscriptProcessingInline({
  state,
  onRecheck,
  rechecking = false,
}: TranscriptProcessingInlineProps) {
  if (state.kind === "idle" || state.kind === "completed") {
    return null;
  }

  if (state.kind === "processing") {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        جارٍ تحويل الصوت إلى نص...
      </p>
    );
  }

  if (state.kind === "timed_out") {
    return (
      <div className="space-y-2 text-sm">
        <p className="text-amber-800 dark:text-amber-200">
          يستغرق أكثر من المعتاد — قد يكون التفريغ ما زال قيد التنفيذ.
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
      {state.errorMessage?.trim() || "فشل التفريغ"}
    </p>
  );
}
