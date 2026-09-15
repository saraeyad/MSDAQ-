import type { TtsPollUiState } from "@/hooks/publishing";
import type { GeneratedAudioStatus } from "@/types";
import { VoiceProcessingCard } from "./VoiceProcessingCard";

function readTtsProgress(status: GeneratedAudioStatus | null | undefined): {
  percent: number | null;
  caption: string;
} {
  if (!status || status.chunks_total == null) {
    return { percent: null, caption: "في الانتظار…" };
  }

  const fromPercent =
    status.progress_percent != null && Number.isFinite(status.progress_percent)
      ? Math.round(status.progress_percent)
      : status.chunks_total > 0
        ? Math.round((status.chunks_done / status.chunks_total) * 100)
        : null;

  return {
    percent: fromPercent != null && fromPercent > 0 ? fromPercent : null,
    caption: `الجزء ${status.chunks_done} من ${status.chunks_total}`,
  };
}

interface TtsProcessingInlineProps {
  state: TtsPollUiState;
  pending?: boolean;
  onRecheck?: () => void;
  rechecking?: boolean;
}

export function TtsProcessingInline({
  state,
  pending = false,
  onRecheck,
  rechecking = false,
}: TtsProcessingInlineProps) {
  const effective: TtsPollUiState =
    pending && (state.kind === "idle" || state.kind === "completed")
      ? { kind: "processing", audioId: 0, pollStatus: null }
      : state;

  if (effective.kind === "idle" || effective.kind === "completed") {
    return null;
  }

  if (effective.kind === "processing") {
    const progress = readTtsProgress(effective.pollStatus);
    return (
      <VoiceProcessingCard
        variant="processing"
        title="جاري توليد الصوت"
        hint="قد يستغرق ذلك دقيقة أو أكثر — لا تغلق الصفحة."
        progressPercent={progress.percent}
        progressCaption={progress.caption}
      />
    );
  }

  if (effective.kind === "timed_out") {
    return (
      <VoiceProcessingCard
        variant="timed_out"
        title="التوليد يستغرق أكثر من المعتاد"
        hint="قد يكون الصوت ما زال قيد الإنشاء. يمكنك التحقق مرة أخرى دون إعادة البدء."
        onRecheck={onRecheck}
        rechecking={rechecking}
      />
    );
  }

  return (
    <VoiceProcessingCard
      variant="failed"
      title="فشل تحويل النص إلى صوت"
      hint="فشل تحويل النص إلى صوت"
      errorMessage={effective.errorMessage}
    />
  );
}
