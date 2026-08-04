import { SmartEditorToolbar } from "@/features/tools/smart-editor/SmartEditorToolbar";
import { Button } from "@/components/ui/button";
import { NextStepButton } from "@/features/publishing-flow/components/NextStepButton";
import { StepActionsRow } from "@/features/publishing-flow/components/StepActionsRow";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ToolProcessingDialog } from "@/features/tools/components/ToolProcessingDialog";
import { getApiErrorMessage } from "@/lib/api-data";
import { resolveMediaUrl } from "@/lib/media-url";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import { Transcripts_APIs } from "@/services/api/transcripts";
import type { ArticleImage } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Mic, PenLine, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { STT_PROCESSING_STEPS } from "@/lib/tts-limits";
import { STT_ACCEPT_ATTR, validateSttAudioFile } from "@/lib/voice-audio";

interface Step3BodyProps {
  articleId: number;
  initialBody?: string | null;
  images?: ArticleImage[];
  onComplete: () => void;
}

export function Step3Body({
  articleId,
  initialBody = "",
  images = [],
  onComplete,
}: Step3BodyProps) {
  const queryClient = useQueryClient();
  const [body, setBody] = useState(initialBody ?? "");
  const [bodyImages, setBodyImages] = useState(images);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcriptJobId, setTranscriptJobId] = useState<number | null>(null);
  const [pendingTranscript, setPendingTranscript] = useState<string | null>(
    null,
  );
  const imageRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!transcriptJobId) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const job = await Transcripts_APIs.get(transcriptJobId);
        if (cancelled) return;

        if (job.status === "completed" && job.transcript?.trim()) {
          setPendingTranscript(job.transcript.trim());
          setTranscriptJobId(null);
          toast.success("اكتمل التفريغ — يمكنك إدراج النص في المقال");
          return;
        }

        if (job.status === "failed") {
          setTranscriptJobId(null);
          toast.error("فشل التفريغ");
          return;
        }
      } catch {
        if (!cancelled) {
          setTranscriptJobId(null);
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
  }, [transcriptJobId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await ArticlesStaff_APIs.updateArticle(articleId, {
        content_formal: body,
      });
      await queryClient.invalidateQueries({
        queryKey: ["staff-article", String(articleId)],
      });
      toast.success("تم حفظ المحتوى — المتابعة لمتعدد اللهجات");
      onComplete();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploadingImages(true);
    try {
      const data = await ArticlesStaff_APIs.uploadBodyImages(
        articleId,
        Array.from(files),
      );
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

    setPendingTranscript(null);
    setTranscribing(true);
    try {
      const result = await ArticlesStaff_APIs.speechToText(articleId, file);

      if (result.status === "completed" && result.transcript?.trim()) {
        setPendingTranscript(result.transcript.trim());
        toast.success("اكتمل التفريغ — يمكنك إدراج النص في المقال");
        return;
      }

      if (result.status === "processing") {
        setTranscriptJobId(result.id);
        toast.success("بدأ التفريغ — سيتم عرض النص عند الانتهاء");
        return;
      }

      toast.error("فشل التفريغ");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setTranscribing(false);
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
      <ToolProcessingDialog
        open={transcribing || !!transcriptJobId}
        title="جاري تفريغ الصوت"
        steps={STT_PROCESSING_STEPS}
        description="قد يستغرق التفريغ عدة دقائق حسب طول التسجيل — يُرجى الانتظار وعدم إغلاق الصفحة."
      />

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

      <div className="space-y-2 rounded-xl border border-border p-4">
        <p className="text-sm font-medium">١ · صوت المصدر ← نص</p>
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => audioRef.current?.click()}
          disabled={transcribing || !!transcriptJobId}
        >
          {(transcribing || transcriptJobId) && (
            <Loader2 className="size-4 animate-spin" />
          )}
          {transcriptJobId ? "جاري التفريغ..." : "صوت إلى نص"}
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

      <div className="space-y-3 rounded-xl border border-border p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">صور المحتوى</p>
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
            {uploadingImages ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
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

      <StepActionsRow>
        <NextStepButton
          onClick={handleSave}
          disabled={saving || !body.trim()}
          loading={saving}
        />
      </StepActionsRow>
    </div>
  );
}
