import { Button } from "@/components/ui/button";
import { NextStepButton } from "@/features/publishing-flow/components/NextStepButton";
import { StepActionsRow } from "@/features/publishing-flow/components/StepActionsRow";
import { Textarea } from "@/components/ui/textarea";
import { TtsVoicePicker } from "@/features/tools/components/TtsVoicePicker";
import { getToolBySlug } from "@/features/tools/tool-config";
import { getApiErrorMessage } from "@/lib/api";
import { readArticleTtsVoice, writeArticleTtsVoice } from "@/lib/publishing";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import { Tts_APIs } from "@/services/api/tools";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const LOCALIZATION_LABEL =
  getToolBySlug("localization")?.label ?? "التبسيط واللهجة";

interface Step6LocalizeProps {
  articleId: number | string;
  bodySimplified?: string | null;
  bodyDialect?: string | null;
  published?: boolean;
  onComplete: () => void;
  onBack?: () => void;
}

export function Step6Localize({
  articleId,
  bodySimplified: initialSimplified = "",
  bodyDialect: initialDialect = "",
  published = false,
  onComplete,
  onBack,
}: Step6LocalizeProps) {
  const queryClient = useQueryClient();
  const [simplified, setSimplified] = useState(initialSimplified ?? "");
  const [dialect, setDialect] = useState(initialDialect ?? "");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [voice, setVoice] = useState(() => readArticleTtsVoice(articleId));
  const [registeringVoice, setRegisteringVoice] = useState(false);

  const { data: voices } = useQuery({
    queryKey: ["tts-voices"],
    queryFn: Tts_APIs.getVoices,
  });

  const handleVoiceChange = (nextVoice: string) => {
    if (published) return;
    setVoice(nextVoice);
    writeArticleTtsVoice(articleId, nextVoice);
    if (!nextVoice.trim()) return;
    setRegisteringVoice(true);
    void ArticlesStaff_APIs.textToSpeech(articleId, { voice: nextVoice })
      .then(() => {
        toast.success("تم تسجيل نوع الصوت. يبدأ التوليد عند النشر");
      })
      .catch((err: unknown) => {
        toast.error(getApiErrorMessage(err));
      })
      .finally(() => {
        setRegisteringVoice(false);
      });
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

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        {LOCALIZATION_LABEL} اختياري، ويمكن الانتقال بين الخطوات بحرية. نسخة
        المقال الصوتية يُنشئها الخادم عند النشر، أو عند حلول موعد الجدولة.
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

      <div className="publish-flow-card space-y-3">
        <h3 className="publish-flow-card__title">نوع الصوت</h3>
        <p className="text-sm text-muted-foreground">
          {published
            ? "لا يمكن تغيير نوع الصوت بعد نشر المقال."
            : "اختر نوع الصوت واستمع إلى عينته. يُرسل الاختيار مع المقال، ويبدأ التوليد عند النشر."}
        </p>
        <TtsVoicePicker
          voices={voices ?? []}
          value={voice}
          onValueChange={handleVoiceChange}
          disabled={registeringVoice}
          locked={published}
          placeholder="اختر الصوت"
          className="min-w-0 sm:max-w-md"
        />
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
