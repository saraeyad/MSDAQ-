import { SmartEditorToolbar } from "@/features/tools/smart-editor/SmartEditorToolbar";
import { TranscriptProcessingInline } from "@/features/tools/components/TranscriptProcessingInline";
import { Button } from "@/components/ui/button";
import { FileUploadProgressCard } from "@/components/ui/file-upload-progress";
import { NextStepButton } from "@/features/publishing-flow/components/NextStepButton";
import { StepActionsRow } from "@/features/publishing-flow/components/StepActionsRow";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useFileUploadProgress } from "@/hooks/useFileUploadProgress";
import { useTranscriptStatusPoll } from "@/hooks/useTranscriptStatusPoll";
import { getApiErrorMessage } from "@/lib/api-data";
import { resolveMediaUrl } from "@/lib/media-url";
import { sttInflightArticleKey } from "@/lib/transcript-status-poll";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import type { ArticleImage } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Mic, PenLine, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import { getToolBySlug } from "@/features/tools/tool-config";
import { STT_ACCEPT_ATTR, validateSttAudioFile } from "@/lib/voice-audio";

const STT_LABEL =
  getToolBySlug("speech-to-text")?.label ?? "تحويل الصوت إلى نص";

interface Step3BodyProps {
  articleId: number | string;
  initialBody?: string | null;
  images?: ArticleImage[];
  onComplete: () => void;
  onBack?: () => void;
}

export function Step3Body({
  articleId,
  initialBody = "",
  images = [],
  onComplete,
  onBack,
}: Step3BodyProps) {
  const queryClient = useQueryClient();
  const [body, setBody] = useState(initialBody ?? "");
  const [bodyImages, setBodyImages] = useState(images);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const audioUpload = useFileUploadProgress();
  const [pendingTranscript, setPendingTranscript] = useState<string | null>(
    null,
  );
  const imageRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);

  const handlePollCompleted = useCallback((transcript: { transcript?: string | null }) => {
    const text = transcript.transcript?.trim();
    if (text) {
      setPendingTranscript(text);
      toast.success("اكتمل التفريغ — يمكنك إدراج النص في المقال");
    }
  }, []);

  const handlePollFailed = useCallback((errorMessage: string | null) => {
    toast.error(errorMessage?.trim() || "فشل التفريغ");
  }, []);

  const sttPoll = useTranscriptStatusPoll({
    storageKey: sttInflightArticleKey(articleId),
    onCompleted: handlePollCompleted,
    onFailed: handlePollFailed,
  });

  const isSttBusy =
    uploadingAudio ||
    audioUpload.progress?.status === "uploading" ||
    sttPoll.isProcessing;

  const handleSave = async () => {
    setSaving(true);
    try {
      await ArticlesStaff_APIs.updateArticle(articleId, {
        content_formal: body,
      });
      await queryClient.invalidateQueries({
        queryKey: ["staff-article", String(articleId)],
      });
      toast.success("تم حفظ المحتوى");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleImages = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files);
    setUploadingImages(true);
    try {
      const data = await ArticlesStaff_APIs.uploadBodyImages(articleId, list);
      setBodyImages(data.images);
      toast.success("تم رفع الصور");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSpeechToText = async (file: File) => {
    const validationError = validateSttAudioFile(file);
    if (validationError) {
      toast.error(validationError);
      if (audioRef.current) audioRef.current.value = "";
      return;
    }

    sttPoll.resetPoll();
    setPendingTranscript(null);
    setUploadingAudio(true);
    audioUpload.start(file);

    try {
      const result = await ArticlesStaff_APIs.speechToText(articleId, file, {
        onUploadProgress: audioUpload.onUploadProgress,
      });
      audioUpload.complete();
      window.setTimeout(audioUpload.reset, 1200);

      if (result.status === "processing") {
        toast.success("بدأ التفريغ — سيتم عرض النص عند الانتهاء");
      }

      sttPoll.trackTranscript(result);
    } catch (err) {
      const message = getApiErrorMessage(err);
      audioUpload.fail(message);
      toast.error(message);
    } finally {
      setUploadingAudio(false);
      if (audioRef.current) audioRef.current.value = "";
    }
  };

  const insertTranscript = () => {
    if (!pendingTranscript) return;
    setBody((prev) =>
      prev.trim()
        ? `${prev.trim()}\n\n${pendingTranscript}`
        : pendingTranscript,
    );
    setPendingTranscript(null);
    toast.success("تم إدراج النص");
  };

  const deleteImage = async (mediaId: number) => {
    try {
      await ArticlesStaff_APIs.deleteBodyImage(articleId, mediaId);
      setBodyImages((prev) => prev.filter((img) => img.id !== mediaId));
      toast.success("تم حذف الصورة");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="publish-step-intro">
        <p className="publish-step-intro__lead">
          اختر كيف تريد إعداد محتوى المقال:
        </p>
        <ol className="publish-step-intro__options">
          <li className="publish-step-intro__option">
            <span className="publish-step-intro__icon" aria-hidden>
              <Mic className="size-4" strokeWidth={1.75} />
            </span>
            <div>
              <p className="publish-step-intro__title">من تسجيل صوتي</p>
              <p className="publish-step-intro__desc">
                ارفع المقابلة أو التسجيل، حوّله إلى نص، ثم أدرجه في المقال
                وحرّره.
              </p>
            </div>
          </li>
          <li className="publish-step-intro__option">
            <span className="publish-step-intro__icon" aria-hidden>
              <PenLine className="size-4" strokeWidth={1.75} />
            </span>
            <div>
              <p className="publish-step-intro__title">كتابة مباشرة</p>
              <p className="publish-step-intro__desc">
                اكتب المحتوى بالفصحى في الحقل أدناه دون رفع ملف صوتي.
              </p>
            </div>
          </li>
        </ol>
      </div>

      <div className="publish-flow-card">
        <p className="publish-flow-card__title">١ · {STT_LABEL}</p>
        <input
          ref={audioRef}
          type="file"
          accept={STT_ACCEPT_ATTR}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleSpeechToText(file);
          }}
        />
        {audioUpload.file && audioUpload.progress ? (
          <FileUploadProgressCard
            file={audioUpload.file}
            status={audioUpload.progress.status}
            progress={audioUpload.progress.progress}
            errorMessage={audioUpload.progress.error}
          />
        ) : null}

        {sttPoll.uiState.kind !== "idle" && (
          <TranscriptProcessingInline
            state={sttPoll.uiState}
            onRecheck={() => void sttPoll.manualRecheck()}
            rechecking={sttPoll.rechecking}
          />
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => audioRef.current?.click()}
          disabled={isSttBusy}
        >
          {isSttBusy && <Loader2 className="size-4 animate-spin" />}
          {sttPoll.isProcessing ? "جاري التفريغ..." : STT_LABEL}
        </Button>
      </div>

      {pendingTranscript && (
        <Card className="border-primary/30">
          <CardContent className="space-y-3 p-4">
            <p className="text-sm font-medium">النص المفرّغ جاهز للإدراج</p>
            <p className="max-h-40 overflow-y-auto whitespace-pre-wrap text-sm text-muted-foreground">
              {pendingTranscript.slice(0, 600)}
              {pendingTranscript.length > 600 ? "…" : ""}
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={insertTranscript}>
                إدراج في المقال
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPendingTranscript(null)}
              >
                تجاهل
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium">٢ · محتوى المقال (فصحى)</p>
        <Textarea
          rows={16}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="font-body text-base leading-relaxed"
        />
      </div>

      <SmartEditorToolbar
        embedded
        value={body}
        onApply={(text) => setBody(text)}
      />

      <div className="publish-flow-card">
        <div className="flex items-center justify-between">
          <p className="publish-flow-card__title">صور المحتوى</p>
          <input
            ref={imageRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => void handleImages(e.target.files)}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => imageRef.current?.click()}
            disabled={uploadingImages}
          >
            <Upload className="size-4" />
            رفع صور
          </Button>
        </div>
        {bodyImages.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {bodyImages.map((img) => (
              <div key={img.id} className="relative">
                <img
                  src={resolveMediaUrl(img.thumb) ?? img.thumb}
                  alt=""
                  className="aspect-video w-full rounded-lg object-cover"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-1 start-1 bg-card/80"
                  onClick={() => deleteImage(img.id)}
                >
                  حذف
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <StepActionsRow onBack={onBack}>
        <Button
          type="button"
          variant="outline"
          onClick={() => void handleSave()}
          disabled={saving || !body.trim()}
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          حفظ المحتوى
        </Button>
        <NextStepButton onClick={onComplete} disabled={saving} />
      </StepActionsRow>
    </div>
  );
}
