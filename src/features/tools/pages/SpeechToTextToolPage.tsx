import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FileInput } from "@/components/ui/file-input";
import { FileUploadProgressCard } from "@/components/ui/file-upload-progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFileUploadProgress, useTranscriptStatusPoll } from "@/hooks/publishing";
import { Textarea } from "@/components/ui/textarea";
import { TranscriptProcessingInline } from "@/features/tools/components/TranscriptProcessingInline";
import { VoiceDraftNotice } from "@/features/tools/components/VoiceDraftNotice";
import { useAuth } from "@/context/auth";
import { useIsSuperAdmin } from "@/hooks/auth";
import { getApiErrorMessage } from "@/lib/api";
import {
  STT_INFLIGHT_STANDALONE_KEY,
} from "@/lib/publishing";
import {
  STT_ACCEPT_ATTR,
  canDeleteVoiceAsset,
  canSaveVoiceAsset,
  formatVoiceAssetSavedMeta,
  validateSttAudioFile,
} from "@/lib/media";
import { ROUTES } from "@/router/routes";
import { Transcripts_APIs } from "@/services/api/transcripts";
import { ToolsVoice_APIs } from "@/services/api/tools";
import type { Transcript } from "@/types";
import { Loader2, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
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
  const [uploading, setUploading] = useState(false);
  const fileUpload = useFileUploadProgress();
  const [saving, setSaving] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const handlePollCompleted = useCallback((completed: Transcript) => {
    setDraft(completed);
    setOwnedDraftId(completed.id);
    setTranscript(completed.transcript?.trim() ?? "");
    toast.success("تم التفريغ — راجع النص ثم احفظه بالاسم");
  }, []);

  const handlePollProcessing = useCallback((transcriptId: number) => {
    setDraft((prev) =>
      prev?.id === transcriptId
        ? prev
        : {
            id: transcriptId,
            article_id: null,
            name: null,
            original_filename: "",
            file_size: 0,
            status: "processing",
            is_saved: false,
            saved_at: null,
            created_at: "",
            updated_at: "",
          },
    );
    setOwnedDraftId(transcriptId);
  }, []);

  const handlePollFailed = useCallback((errorMessage: string | null) => {
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            status: "failed",
            error_message: errorMessage,
          }
        : prev,
    );
    toast.error(errorMessage?.trim() || "فشل التفريغ");
  }, []);

  const sttPoll = useTranscriptStatusPoll({
    storageKey: STT_INFLIGHT_STANDALONE_KEY,
    onCompleted: handlePollCompleted,
    onFailed: handlePollFailed,
    onProcessing: handlePollProcessing,
  });

  const isSessionOwner =
    draft != null &&
    (ownedDraftId === draft.id ||
      (draft.user_id != null && draft.user_id === user?.id));

  const canSave = draft ? canSaveVoiceAsset(draft, user, isSessionOwner) : false;
  const canDiscard = draft
    ? canDeleteVoiceAsset(draft, user, isSuperAdmin, isSessionOwner)
    : false;

  const isUploadBusy = uploading || fileUpload.progress?.status === "uploading";
  const isPollActive = sttPoll.uiState.kind === "processing";
  const isProcessing = isUploadBusy || isPollActive;
  const draftReady = draft?.status === "completed";

  const handleFile = (selected: File | null) => {
    if (!selected) {
      setFile(null);
      fileUpload.reset();
      return;
    }
    const validationError = validateSttAudioFile(selected);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    sttPoll.resetPoll();
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

    sttPoll.resetPoll();
    setDraft(null);
    setOwnedDraftId(null);
    setTranscript("");
    setName("");
    fileUpload.start(file);
    setUploading(true);

    try {
      const data = await ToolsVoice_APIs.speechToText(file, {
        onUploadProgress: fileUpload.onUploadProgress,
      });
      fileUpload.complete();
      setDraft(data);
      setOwnedDraftId(data.id);
      sttPoll.trackTranscript(data);

      if (data.status === "processing") {
        toast.success("بدأ التفريغ — سيتم عرض النص عند الانتهاء");
      }
    } catch (err) {
      const message = getApiErrorMessage(err);
      fileUpload.fail(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!draft || !canSave || !draftReady) return;
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
    setDiscarding(true);
    try {
      await Transcripts_APIs.delete(draft.id);
      sttPoll.resetPoll();
      setDraft(null);
      setOwnedDraftId(null);
      setTranscript("");
      setName("");
      setConfirmDiscard(false);
      toast.success("تم حذف المسودة");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDiscarding(false);
    }
  };

  const savedMeta = draft?.is_saved ? formatVoiceAssetSavedMeta(draft) : null;
  const showInlineStatus =
    sttPoll.uiState.kind !== "idle" &&
    (sttPoll.uiState.kind !== "completed" || !draft);

  return (
    <ToolPageShell title="تحويل الصوت إلى نص">
      <VoiceDraftNotice generateLabel="تفريغ" saveLabel="حفظ في المكتبة" />

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <Label>ملف صوتي (MP3, WAV, M4A — حتى 25 ميغابايت)</Label>
            {file && fileUpload.progress ? (
              <FileUploadProgressCard
                file={file}
                status={fileUpload.progress.status}
                progress={fileUpload.progress.progress}
                errorMessage={fileUpload.progress.error}
                onRemove={
                  isProcessing
                    ? undefined
                    : () => handleFile(null)
                }
              />
            ) : (
              <FileInput
                accept={STT_ACCEPT_ATTR}
                value={file}
                onChange={handleFile}
                disabled={isProcessing}
                chooseLabel="اختر ملفاً"
                emptyLabel="لم يُختَر ملف صوتي بعد"
              />
            )}
          </div>

          {showInlineStatus && (
            <TranscriptProcessingInline
              state={sttPoll.uiState}
              onRecheck={() => void sttPoll.manualRecheck()}
              rechecking={sttPoll.rechecking}
            />
          )}

          <Button onClick={transcribe} disabled={isProcessing || !file}>
            {isUploadBusy && <Loader2 className="size-4 animate-spin" />}
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
              disabled={!draftReady}
            />

            {!draft.is_saved && draftReady && canSave && (
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
              <Link to={ROUTES.NEWSROOM_TOOL.replace(":tool", "transcripts")}>
                الانتقال إلى مكتبة النصوص
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
