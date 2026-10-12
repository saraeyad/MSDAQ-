import { Button } from "@/components/ui/button";
import { NextStepButton } from "@/features/publishing-flow/components/NextStepButton";
import { StepActionsRow } from "@/features/publishing-flow/components/StepActionsRow";
import { Textarea } from "@/components/ui/textarea";
import { TtsProcessingInline } from "@/features/tools/components/TtsProcessingInline";
import { TtsVoicePicker } from "@/features/tools/components/TtsVoicePicker";
import { getToolBySlug } from "@/features/tools/tool-config";
import { useTtsStatusPoll } from "@/hooks/publishing";
import { getApiErrorMessage } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";
import {
  clearPendingArticleNarrationId,
  readArticleTtsVoice,
  ttsInflightArticleKey,
  writeArticleTtsVoice,
  writePendingArticleNarrationId,
} from "@/lib/publishing";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import { ToolsVoice_APIs, Tts_APIs } from "@/services/api/tools";
import type { GeneratedAudio, StaffArticle } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const LOCALIZATION_LABEL =
  getToolBySlug("localization")?.label ?? "التبسيط واللهجة";
const TTS_LABEL =
  getToolBySlug("text-to-speech")?.label ?? "تحويل النص إلى صوت";

function resolveArticleGeneratedAudioUrl(
  raw: string | null | undefined,
): string {
  if (!raw?.trim()) return "";
  return resolveMediaUrl(raw) ?? raw;
}

interface Step6LocalizeProps {
  articleId: number | string;
  bodyFormal?: string | null;
  bodySimplified?: string | null;
  bodyDialect?: string | null;
  generatedAudio?: string | null;
  onComplete: () => void;
  onBack?: () => void;
}

export function Step6Localize({
  articleId,
  bodySimplified: initialSimplified = "",
  bodyDialect: initialDialect = "",
  generatedAudio: initialGeneratedAudio = "",
  onComplete,
  onBack,
}: Step6LocalizeProps) {
  const queryClient = useQueryClient();
  const [simplified, setSimplified] = useState(initialSimplified ?? "");
  const [dialect, setDialect] = useState(initialDialect ?? "");
  const [generatedAudio, setGeneratedAudio] = useState(() =>
    resolveArticleGeneratedAudioUrl(initialGeneratedAudio),
  );
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [voice, setVoice] = useState(() => readArticleTtsVoice(articleId));
  const [startingTts, setStartingTts] = useState(false);
  const [savingAudio, setSavingAudio] = useState(false);
  const [savedAudioId, setSavedAudioId] = useState<number | null>(null);

  useEffect(() => {
    setGeneratedAudio(resolveArticleGeneratedAudioUrl(initialGeneratedAudio));
  }, [initialGeneratedAudio]);

  const { data: voices } = useQuery({
    queryKey: ["tts-voices"],
    queryFn: Tts_APIs.getVoices,
  });

  const refreshArticleMedia = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ["staff-article", String(articleId)],
    });
    await queryClient.invalidateQueries({
      queryKey: ["staff", "article-media", String(articleId)],
    });
    await queryClient.refetchQueries({
      queryKey: ["staff-article", String(articleId)],
    });
  }, [articleId, queryClient]);

  const handleTtsCompleted = useCallback(
    async (audio: GeneratedAudio) => {
      await refreshArticleMedia();

      const article = queryClient.getQueryData<StaffArticle>([
        "staff-article",
        String(articleId),
      ]);
      const fromArticle = resolveArticleGeneratedAudioUrl(
        article?.generated_audio,
      );
      if (fromArticle) {
        setGeneratedAudio(fromArticle);
      } else if (audio.audio_url != null) {
        setGeneratedAudio(
          resolveMediaUrl(audio.audio_url) ?? audio.audio_url,
        );
      }

      toast.success("تم توليد النسخة الصوتية");
    },
    [articleId, queryClient, refreshArticleMedia],
  );

  const handleTtsFailed = useCallback(
    (errorMessage: string | null) => {
      clearPendingArticleNarrationId(articleId);
      toast.error(errorMessage?.trim() || "فشل تحويل النص إلى صوت");
    },
    [articleId],
  );

  const handleVoiceChange = (nextVoice: string) => {
    setVoice(nextVoice);
    writeArticleTtsVoice(articleId, nextVoice);
  };

  const ttsPoll = useTtsStatusPoll({
    storageKey: ttsInflightArticleKey(articleId),
    onCompleted: (audio) => void handleTtsCompleted(audio),
    onFailed: handleTtsFailed,
  });

  const isTtsBusy = startingTts || ttsPoll.isProcessing;
  const completedAudio =
    ttsPoll.uiState.kind === "completed" ? ttsPoll.uiState.audio : null;
  const audioSaved =
    completedAudio != null &&
    (completedAudio.is_saved || savedAudioId === completedAudio.id);

  const handleSaveAudio = async () => {
    if (!completedAudio || completedAudio.status !== "completed" || audioSaved) {
      return;
    }
    setSavingAudio(true);
    try {
      const saved = await ToolsVoice_APIs.saveGeneratedAudio(completedAudio.id, {
        name: "النسخة الصوتية",
      });
      setSavedAudioId(saved.id);
      clearPendingArticleNarrationId(articleId);
      const url =
        saved.audio_url != null
          ? (resolveMediaUrl(saved.audio_url) ?? saved.audio_url)
          : "";
      if (url) setGeneratedAudio(url);
      await refreshArticleMedia();
      toast.success("تم حفظ النسخة الصوتية");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSavingAudio(false);
    }
  };

  const generate = async () => {
    setGenerating(true);
    try {
      const data = await ArticlesStaff_APIs.generateLocalization(articleId);
      setSimplified(data.simplified);
      setDialect(data.dialect);
      toast.success("تم إنشاء النسختين — راجعهما قبل الحفظ");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await ArticlesStaff_APIs.updateArticle(articleId, {
        content_simplified: simplified || undefined,
        content_dialect: dialect || undefined,
      });
      await queryClient.invalidateQueries({
        queryKey: ["staff-article", String(articleId)],
      });
      toast.success("تم حفظ اللهجات");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleTts = async () => {
    if (!voice) return;
    ttsPoll.resetPoll();
    setStartingTts(true);
    try {
      const data = await ArticlesStaff_APIs.textToSpeech(articleId, {
        voice,
      });
      if (data.status !== "failed") {
        writePendingArticleNarrationId(articleId, data.id);
      }
      ttsPoll.trackAudio(data);
      if (data.status === "processing") {
        toast.success("بدأ التوليد — سيتم عرض الصوت عند الانتهاء");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setStartingTts(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        {LOCALIZATION_LABEL} اختياري، ويمكن الانتقال بين الخطوات بحرية. إن لم
        تُحفظ نسخة صوتية، تُنشأ عند النشر أو الجدولة.
      </p>

      <Button variant="outline" onClick={generate} disabled={generating}>
        {generating && <Loader2 className="size-4 animate-spin" />}
        توليد النسختين معاً
      </Button>

      <div className="space-y-3">
        <h3 className="font-semibold">نسخة مبسّطة</h3>
        <Textarea
          rows={6}
          value={simplified}
          onChange={(e) => setSimplified(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">نسخة عامية</h3>
        <Textarea
          rows={6}
          value={dialect}
          onChange={(e) => setDialect(e.target.value)}
        />
      </div>

      <div className="publish-flow-card">
        <h3 className="publish-flow-card__title">{TTS_LABEL}</h3>
        <p className="text-sm text-muted-foreground">
          اختر الصوت إن أردت، ثم ولّد الملف واحفظه. عند النشر يُستخدم هذا
          الصوت إن وُجد، وإلا يُستخدم الصوت الافتراضي.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <TtsVoicePicker
            voices={voices ?? []}
            value={voice}
            onValueChange={handleVoiceChange}
            disabled={isTtsBusy}
            placeholder="اختر الصوت"
            className="min-w-0 flex-1 sm:max-w-md"
          />
          <Button
            variant="outline"
            onClick={() => void handleTts()}
            disabled={!voice || isTtsBusy}
          >
            {(startingTts || ttsPoll.isProcessing) && (
              <Loader2 className="size-4 animate-spin" />
            )}
            {TTS_LABEL}
          </Button>
          <Button
            onClick={() => void handleSaveAudio()}
            disabled={
              !completedAudio ||
              completedAudio.status !== "completed" ||
              audioSaved ||
              savingAudio ||
              isTtsBusy
            }
          >
            {savingAudio && <Loader2 className="size-4 animate-spin" />}
            {audioSaved ? "تم الحفظ" : "حفظ"}
          </Button>
          {ttsPoll.uiState.kind === "failed" && (
            <Button
              variant="outline"
              onClick={() => void handleTts()}
              disabled={!voice || isTtsBusy}
            >
              إعادة المحاولة
            </Button>
          )}
        </div>

        {ttsPoll.uiState.kind !== "idle" &&
          ttsPoll.uiState.kind !== "completed" && (
            <TtsProcessingInline
              state={ttsPoll.uiState}
              onRecheck={() => void ttsPoll.manualRecheck()}
              rechecking={ttsPoll.rechecking}
            />
          )}

        {generatedAudio && (
          <audio controls className="w-full" src={generatedAudio} />
        )}
      </div>

      <StepActionsRow onBack={onBack}>
        <Button
          variant="outline"
          onClick={() => void handleSave()}
          disabled={saving}
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          حفظ اللهجات
        </Button>
        <NextStepButton onClick={onComplete} disabled={saving} />
      </StepActionsRow>
    </div>
  );
}
