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
import {
  runWithToolProcessing,
  ToolProcessingDialog,
} from "@/features/tools/components/ToolProcessingDialog";
import { getApiErrorMessage } from "@/lib/api-data";
import { resolveMediaUrl } from "@/lib/media-url";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import { Tts_APIs } from "@/services/api/tools";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const TTS_STEPS = [
  "جاري تحضير النص...",
  "جاري توليد الصوت...",
  "جاري إعداد الملف الصوتي...",
] as const;

interface Step6LocalizeProps {
  articleId: number;
  bodyFormal?: string | null;
  bodySimplified?: string | null;
  bodyDialect?: string | null;
  generatedAudio?: string | null;
  onComplete: () => void;
  onSkip: () => void;
}

export function Step6Localize({
  articleId,
  bodyFormal = "",
  bodySimplified: initialSimplified = "",
  bodyDialect: initialDialect = "",
  generatedAudio: initialGeneratedAudio = "",
  onComplete,
  onSkip,
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
  const [generatingTts, setGeneratingTts] = useState(false);

  const { data: voices } = useQuery({
    queryKey: ["tts-voices"],
    queryFn: Tts_APIs.getVoices,
  });

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
      onComplete();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleTts = async () => {
    if (!voice) return;
    try {
      await runWithToolProcessing(setGeneratingTts, async () => {
        const data = await ArticlesStaff_APIs.textToSpeech(articleId, {
          voice,
          style: "اقرأ بنبرة إخبارية رسمية وهادئة",
        });
        const url = resolveMediaUrl(data.audio_url) ?? data.audio_url;
        setGeneratedAudio(url);
        await queryClient.invalidateQueries({
          queryKey: ["staff-article", String(articleId)],
        });
        toast.success("تم توليد النسخة الصوتية");
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <ToolProcessingDialog
        open={generatingTts}
        title="جاري تحويل النص إلى صوت"
        steps={TTS_STEPS}
      />

      <p className="text-muted-foreground">
        متعدد اللهجات اختياري. يجب مراجعة كل نسخة يدوياً قبل الحفظ.
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

      <div className="space-y-4 rounded-xl border border-border bg-card p-4">
        <h3 className="font-semibold">توليد النسخة الصوتية (اختياري)</h3>
        <div className="flex flex-wrap gap-3">
          <Select value={voice || undefined} onValueChange={setVoice}>
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
            onClick={handleTts}
            disabled={!voice || generatingTts}
          >
            توليد صوت
          </Button>
        </div>
        {generatedAudio && (
          <audio controls className="w-full" src={generatedAudio} />
        )}
      </div>

      <StepActionsRow>
        <Button variant="outline" onClick={onSkip}>
          تخطي
        </Button>
        <NextStepButton onClick={handleSave} disabled={saving} loading={saving} />
      </StepActionsRow>
    </div>
  );
}
