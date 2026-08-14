import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { VoiceDraftNotice } from "@/features/tools/components/VoiceDraftNotice";
import {
  runWithToolProcessing,
  ToolProcessingDialog,
} from "@/features/tools/components/ToolProcessingDialog";
import { useAuth } from "@/context/auth";
import { useIsSuperAdmin } from "@/hooks/useIsSuperAdmin";
import { getApiErrorMessage } from "@/lib/api-data";
import { resolveMediaUrl } from "@/lib/media-url";
import { validateTtsText } from "@/lib/tts-limits";
import {
  canDeleteVoiceAsset,
  canSaveVoiceAsset,
  formatVoiceAssetSavedMeta,
} from "@/lib/voice-asset-access";
import { TTS_PROCESSING_STEPS } from "@/lib/tool-processing-steps";
import { ROUTES } from "@/router/routes";
import { ToolsVoice_APIs, Tts_APIs } from "@/services/api/tools";
import type { GeneratedAudio, TtsVoice } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ToolPageShell } from "./ToolPageShell";

export function TextToSpeechToolPage() {
  const { user } = useAuth();
  const isSuperAdmin = useIsSuperAdmin();
  const [text, setText] = useState("");
  const [style, setStyle] = useState("");
  const [voice, setVoice] = useState("");
  const [name, setName] = useState("");
  const [draft, setDraft] = useState<GeneratedAudio | null>(null);
  const [ownedDraftId, setOwnedDraftId] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const voicesQuery = useQuery({
    queryKey: ["tts-voices"],
    queryFn: Tts_APIs.getVoices,
  });

  const voices = voicesQuery.data ?? [];
  const isSessionOwner =
    draft != null &&
    (ownedDraftId === draft.id ||
      (draft.user_id != null && draft.user_id === user?.id));

  const canSave = draft ? canSaveVoiceAsset(draft, user, isSessionOwner) : false;
  const canDiscard = draft
    ? canDeleteVoiceAsset(draft, user, isSuperAdmin, isSessionOwner)
    : false;

  const generate = async () => {
    const validationError = validateTtsText(text);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    if (!voice) {
      toast.error("اختر صوتاً");
      return;
    }

    setDraft(null);
    setOwnedDraftId(null);
    setName("");
    try {
      await runWithToolProcessing(setGenerating, async () => {
        const data = await ToolsVoice_APIs.textToSpeech({
          text: text.trim(),
          voice,
          style: style.trim() || undefined,
        });
        setDraft(data);
        setOwnedDraftId(data.id);
        toast.success("تم إنشاء المسودة — استمع ثم احفظها بالاسم");
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const save = async () => {
    if (!draft || !canSave) return;
    if (!name.trim()) {
      toast.error("أدخل اسماً للملف");
      return;
    }
    setSaving(true);
    try {
      const saved = await ToolsVoice_APIs.saveGeneratedAudio(draft.id, {
        name: name.trim(),
      });
      setDraft(saved);
      toast.success("تم حفظ الملف الصوتي في المكتبة");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const discardDraft = async () => {
    if (!draft || !canDiscard) return;
    setDiscarding(true);
    try {
      await ToolsVoice_APIs.deleteGeneratedAudio(draft.id);
      setDraft(null);
      setOwnedDraftId(null);
      setName("");
      setConfirmDiscard(false);
      toast.success("تم حذف المسودة");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDiscarding(false);
    }
  };

  const audioUrl = draft
    ? (resolveMediaUrl(draft.audio_url) ?? draft.audio_url)
    : null;
  const savedMeta = draft?.is_saved ? formatVoiceAssetSavedMeta(draft) : null;

  return (
    <ToolPageShell title="تحويل النص إلى صوت">
      <ToolProcessingDialog
        open={generating}
        title="جاري تحويل النص إلى صوت"
        steps={TTS_PROCESSING_STEPS}
        description="قد يستغرق التوليد بعض الوقت — لا تغلق الصفحة."
      />

      <VoiceDraftNotice generateLabel="إنشاء" saveLabel="حفظ في المكتبة" />

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <Label>الصوت</Label>
            <Select value={voice} onValueChange={setVoice}>
              <SelectTrigger>
                <SelectValue placeholder="اختر صوتاً" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((v: TtsVoice) => (
                  <SelectItem key={v.name} value={v.name}>
                    {v.description || v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>النص</Label>
            <Textarea
              placeholder="أدخل النص المراد تحويله إلى صوت..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
            />
          </div>

          <Input
            placeholder="أسلوب اختياري (style)"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          />

          <Button
            onClick={generate}
            disabled={generating || voicesQuery.isLoading}
          >
            {voicesQuery.isLoading && (
              <Loader2 className="size-4 animate-spin" />
            )}
            إنشاء (مسودة)
          </Button>
        </CardContent>
      </Card>

      {draft && (
        <Card>
          <CardContent className="space-y-4 p-6">
            {!draft.is_saved && (
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
                مسودة #{draft.id} — غير محفوظة. احفظها بالاسم قبل المغادرة.
              </p>
            )}

            {audioUrl && <audio controls src={audioUrl} className="w-full" />}

            {!draft.is_saved && canSave && (
              <>
                <Input
                  placeholder="اسم الملف في المكتبة"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  <Button onClick={save} disabled={saving || !name.trim()}>
                    {saving && <Loader2 className="size-4 animate-spin" />}
                    حفظ في المكتبة
                  </Button>
                  {canDiscard && (
                    <Button
                      variant="outline"
                      onClick={() => setConfirmDiscard(true)}
                      disabled={discarding}
                      className="text-destructive hover:text-destructive"
                    >
                      {discarding ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                      حذف المسودة
                    </Button>
                  )}
                </div>
              </>
            )}

            {draft.is_saved && (
              <p className="text-sm text-success">
                تم الحفظ في المكتبة
                {savedMeta ? ` — ${savedMeta}` : ""}
              </p>
            )}

            <Button asChild variant="outline" size="sm">
              <Link
                to={ROUTES.NEWSROOM_TOOL.replace(":tool", "generated-audios")}
              >
                الانتقال إلى مكتبة الملفات الصوتية
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
      <ConfirmDialog
        open={confirmDiscard}
        description="هل تريد حذف هذه المسودة؟ لا يمكن التراجع عن هذا الإجراء."
        isPending={discarding}
        onClose={() => setConfirmDiscard(false)}
        onConfirm={() => void discardDraft()}
      />
    </ToolPageShell>
  );
}
