import type { TranscriptPollUiState } from "@/hooks/publishing";
import { VoiceProcessingCard } from "./VoiceProcessingCard";

interface TranscriptProcessingInlineProps {
  state: TranscriptPollUiState;
  pending?: boolean;
  onRecheck?: () => void;
  rechecking?: boolean;
}

export function TranscriptProcessingInline({
  state,
  pending = false,
  onRecheck,
  rechecking = false,
}: TranscriptProcessingInlineProps) {
  const effective: TranscriptPollUiState =
    pending && (state.kind === "idle" || state.kind === "completed")
      ? { kind: "processing", transcriptId: 0 }
      : state;

  if (effective.kind === "idle" || effective.kind === "completed") {
    return null;
  }

  if (effective.kind === "processing") {
    return (
      <VoiceProcessingCard
        variant="processing"
        title="جاري تحويل الصوت إلى نص"
        hint="يُفرَّغ الملف الآن — لا تغلق الصفحة."
      />
    );
  }

  if (effective.kind === "timed_out") {
    return (
      <VoiceProcessingCard
        variant="timed_out"
        title="التفريغ يستغرق أكثر من المعتاد"
        hint="قد يكون التحويل ما زال قيد التنفيذ. يمكنك التحقق مرة أخرى دون إعادة الرفع."
        onRecheck={onRecheck}
        rechecking={rechecking}
      />
    );
  }

  return (
    <VoiceProcessingCard
      variant="failed"
      title="فشل التفريغ"
      hint="فشل التفريغ"
      errorMessage={effective.errorMessage}
    />
  );
}
