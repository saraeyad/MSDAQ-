import { Button } from "@/components/ui/button";
import { NextStepButton } from "@/features/publishing-flow/components/NextStepButton";
import { StepActionsRow } from "@/features/publishing-flow/components/StepActionsRow";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TtsProcessingInline } from "@/features/tools/components/TtsProcessingInline";
import { getToolBySlug } from "@/features/tools/tool-config";
import { useTtsStatusPoll } from "@/hooks/publishing";
import { getApiErrorMessage } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";
import { ttsInflightArticleKey } from "@/lib/publishing";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import { Tts_APIs } from "@/services/api/tools";
import type { GeneratedAudio } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const LOCALIZATION_LABEL =
  getToolBySlug("localization")?.label ?? "التبسيط واللهجة";
const TTS_LABEL =
  getToolBySlug("text-to-speech")?.label ?? "تحويل النص إلى صوت";

const ARTICLE_TTS_STYLE = "اقرأ بنبرة إخبارية رسمية وهادئة";

interface Step6LocalizeProps {
  articleId: number | string;
  bodyFormal?: string | null;
  bodySimplified?: string | null;
  bodyDialect?: string | null;
  generatedAudio?: string | null;
  onComplete: () => void;
  onSkip: () => void;
  onBack?: () => void;
}

export function Step6Localize({
  articleId,
  bodySimplified: initialSimplified = "",
  bodyDialect: initialDialect = "",
  generatedAudio: initialGeneratedAudio = "",
  onComplete,
  onSkip,
  onBack,
}: Step6LocalizeProps) {
  const queryClient = useQueryClient();
  const [simplified, setSimplified] = useState(initialSimplified ?? "");
  const [dialect, setDialect] = useState(initialDialect ?? "");
  const [generatedAudio, setGeneratedAudio] = useState(
    resolveMediaUrl(initialGeneratedAudio) ?? initialGeneratedAudio ?? "",
  );
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [voice, setVoice] = useState("");
  const [startingTts, setStartingTts] = useState(false);

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
  }, [articleId, queryClient]);

  const handleTtsCompleted = useCallback(
    async (audio: GeneratedAudio) => {
      const url =
        audio.audio_url != null
          ? (resolveMediaUrl(audio.audio_url) ?? audio.audio_url)
          : "";
      if (url) {
        setGeneratedAudio(url);
      }
      await refreshArticleMedia();
      toast.success("تم توليد النسخة الصوتية");
    },
    [refreshArticleMedia],
  );

  const handleTtsFailed = useCallback((errorMessage: string | null) => {
    toast.error(errorMessage?.trim() || "فشل تحويل النص إلى صوت");
  }, []);

  const ttsPoll = useTtsStatusPoll({
    storageKey: ttsInflightArticleKey(articleId),
    onCompleted: (audio) => void handleTtsCompleted(audio),
    onFailed: handleTtsFailed,
  });

  const isTtsBusy = startingTts || ttsPoll.isProcessing;

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
        style: ARTICLE_TTS_STYLE,
      });
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
        {LOCALIZATION_LABEL} اختياري. يجب مراجعة كل نسخة يدوياً قبل الحفظ.
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
        <h3 className="publish-flow-card__title">{TTS_LABEL} (اختياري)</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={voice || undefined}
            onValueChange={setVoice}
            disabled={isTtsBusy}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="اختر الصوت" />
            </SelectTrigger>
            <SelectContent>
              {voices?.map((v) => (
                <SelectItem key={v.name} value={v.name}>
                  {v.description} ({v.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        <Button variant="outline" onClick={onSkip}>
          تخطي
        </Button>
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
