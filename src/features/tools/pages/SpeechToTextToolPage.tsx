import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VoiceDraftNotice } from "@/features/tools/components/VoiceDraftNotice";
import {
  runWithToolProcessing,
  ToolProcessingDialog,
} from "@/features/tools/components/ToolProcessingDialog";
import { useAuth } from "@/context/auth";
import { useIsSuperAdmin } from "@/hooks/useIsSuperAdmin";
import { getApiErrorMessage } from "@/lib/api-data";
import { STT_PROCESSING_STEPS } from "@/lib/tts-limits";
import {
  STT_ACCEPT_ATTR,
  validateSttAudioFile,
} from "@/lib/voice-audio";
import {
  canDeleteVoiceAsset,
  canSaveVoiceAsset,
  formatVoiceAssetSavedMeta,
} from "@/lib/voice-asset-access";
import { ROUTES } from "@/router/routes";
import { Transcripts_APIs } from "@/services/api/transcripts";
import { ToolsVoice_APIs } from "@/services/api/tools";
import type { Transcript } from "@/types";
import { Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ToolPageShell } from "./ToolPageShell";

export function SpeechToTextToolPage() {
  const { user } = useAuth();
  const isSuperAdmin = useIsSuperAdmin();
  const [file, setFile] = useState<File | null>(null);
  const [draft, setDraft] = useState<Transcript | null>(null);
  const [ownedDraftId, setOwnedDraftId] = useState<number | null>(null);
  const [transcript, setTranscript] = useState("");
  const [name, setName] = useState("");
  const [transcribing, setTranscribing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [discarding, setDiscarding] = useState(false);

  const isSessionOwner =
    draft != null &&
    (ownedDraftId === draft.id ||
      (draft.user_id != null && draft.user_id === user?.id));

  const canSave = draft ? canSaveVoiceAsset(draft, user, isSessionOwner) : false;
  const canDiscard = draft
    ? canDeleteVoiceAsset(draft, user, isSuperAdmin, isSessionOwner)
    : false;

  const isProcessing = transcribing || draft?.status === "processing";

  useEffect(() => {
    if (!draft || draft.status !== "processing") return;

    let cancelled = false;
    const poll = async () => {
      try {
        const job = await Transcripts_APIs.get(draft.id);
        if (cancelled) return;

        setDraft(job);

        if (job.status === "completed") {
          setTranscript(job.transcript?.trim() ?? "");
          toast.success("اكتمل التفريغ");
          return;
        }

        if (job.status === "failed") {
          toast.error("فشل التفريغ");
        }
      } catch {
        if (!cancelled) {
          toast.error("تعذّر متابعة حالة التفريغ");
        }
      }
    };

    void poll();
    const interval = window.setInterval(poll, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [draft?.id, draft?.status]);

  const handleFile = (selected: File | null) => {
    if (!selected) {
      setFile(null);
      return;
    }
    const validationError = validateSttAudioFile(selected);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setFile(selected);
    setDraft(null);
    setOwnedDraftId(null);
    setTranscript("");
    setName("");
  };

  const transcribe = async () => {
    if (!file) {
      toast.error("اختر ملفاً صوتياً");
      return;
    }
    const validationError = validateSttAudioFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setDraft(null);
    setOwnedDraftId(null);
    setTranscript("");
    setName("");
    try {
      await runWithToolProcessing(setTranscribing, async () => {
        const data = await ToolsVoice_APIs.speechToText(file);
        setDraft(data);
        setOwnedDraftId(data.id);
        if (data.status === "completed") {
          setTranscript(data.transcript?.trim() ?? "");
          toast.success("تم التفريغ — راجع النص ثم احفظه بالاسم");
        } else if (data.status === "processing") {
          toast.success("بدأ التفريغ — سيتم عرض النص عند الانتهاء");
        } else {
          toast.error("فشل التفريغ");
        }
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const save = async () => {
    if (!draft || !canSave) return;
    if (!name.trim()) {
      toast.error("أدخل اسماً للنص");
      return;
    }
    setSaving(true);
    try {
      const saved = await Transcripts_APIs.save(draft.id, {
        name: name.trim(),
        transcript: transcript.trim() || undefined,
      });
      setDraft(saved);
      toast.success("تم حفظ النص في المكتبة");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const discardDraft = async () => {
    if (!draft || !canDiscard) return;
    if (!window.confirm("حذف هذه المسودة؟")) return;
    setDiscarding(true);
    try {
      await Transcripts_APIs.delete(draft.id);
      setDraft(null);
      setOwnedDraftId(null);
      setTranscript("");
      setName("");
      toast.success("تم حذف المسودة");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDiscarding(false);
    }
  };

  const savedMeta = draft?.is_saved ? formatVoiceAssetSavedMeta(draft) : null;

  return (
    <ToolPageShell title="تحويل الصوت إلى نص">
      <ToolProcessingDialog
        open={isProcessing}
        title="جاري تفريغ الصوت"
        steps={STT_PROCESSING_STEPS}
        description="قد يستغرق التفريغ عدة دقائق حسب طول التسجيل — يُرجى الانتظار وعدم إغلاق الصفحة."
      />

      <VoiceDraftNotice generateLabel="تفريغ" saveLabel="حفظ في المكتبة" />

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <Label>ملف صوتي (MP3, WAV, M4A — حتى 25 ميغابايت)</Label>
            <Input
              type="file"
              accept={STT_ACCEPT_ATTR}
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              disabled={isProcessing}
            />
          </div>

          <Button onClick={transcribe} disabled={isProcessing || !file}>
            تفريغ (إنشاء مسودة)
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

            <Textarea
              placeholder="النص المفرّغ — يمكنك تصحيحه قبل الحفظ..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={10}
              disabled={isProcessing || draft.status === "failed"}
            />

            {!draft.is_saved && draft.status === "completed" && canSave && (
              <>
                <Input
                  placeholder="اسم النص في المكتبة"
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
                      onClick={discardDraft}
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
              <Link to={ROUTES.NEWSROOM_TOOL.replace(":tool", "transcripts")}>
                الانتقال إلى مكتبة النصوص
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </ToolPageShell>
  );
}
