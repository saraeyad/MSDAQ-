import { CoverUploadSection } from "@/features/publishing-flow/steps/Step2Cover/CoverUploadSection";
import { Button } from "@/components/ui/button";
import { NextStepButton } from "@/features/publishing-flow/components/NextStepButton";
import { StepActionsRow } from "@/features/publishing-flow/components/StepActionsRow";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  runWithToolProcessing,
  ToolProcessingDialog,
} from "@/features/tools/components/ToolProcessingDialog";
import { getApiErrorMessage } from "@/lib/api-data";
import { mediaStepComplete } from "@/lib/publish-gate";
import {
  AI_DETECTION_PROCESSING_STEPS,
  REVERSE_IMAGE_PROCESSING_STEPS,
} from "@/lib/tool-processing-steps";
import { absoluteMediaUrlForApi, resolveMediaUrl } from "@/lib/media-url";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import { ImageVerification_APIs } from "@/services/api/tools";
import type {
  AiDetectionResult,
  ReverseSearchMatch,
  StaffArticle,
} from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Step2CoverProps {
  article: StaffArticle;
  onComplete: () => void;
  onBack?: () => void;
}

export function Step2Cover({ article, onComplete, onBack }: Step2CoverProps) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState(
    resolveMediaUrl(article.cover_image) ?? "",
  );
  const [audioPreview, setAudioPreview] = useState(
    resolveMediaUrl(article.source_audio) ?? "",
  );
  const [mediaUrl, setMediaUrl] = useState(article.media_url ?? "");
  const [videoPreview, setVideoPreview] = useState(
    resolveMediaUrl(article.video) ?? "",
  );
  const [videoStatus, setVideoStatus] = useState(article.video_status);
  const [uploading, setUploading] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [savingMediaUrl, setSavingMediaUrl] = useState(false);
  const [searching, setSearching] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [searchResults, setSearchResults] = useState<ReverseSearchMatch[]>([]);
  const [reverseSearched, setReverseSearched] = useState(false);
  const [aiResult, setAiResult] = useState<AiDetectionResult | null>(null);
  const [blurMode, setBlurMode] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [publicCoverUrl, setPublicCoverUrl] = useState<string | null>(() =>
    absoluteMediaUrlForApi(article.cover_image),
  );

  const articleId = article.id;
  const mediaType = article.media_type;

  useEffect(() => {
    const url = absoluteMediaUrlForApi(article.cover_image);
    if (url) setPublicCoverUrl(url);

    const displayUrl = resolveMediaUrl(article.cover_image);
    if (displayUrl) {
      setPreview((current) =>
        current.startsWith("blob:") ? current : displayUrl,
      );
    }
  }, [article.cover_image]);

  const refreshArticle = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["staff-article", String(articleId)],
    });
  };

  useEffect(() => {
    if (mediaType !== "video" || mediaUrl.trim() || videoStatus !== "processing") {
      return;
    }

    const interval = window.setInterval(async () => {
      try {
        const updated = await ArticlesStaff_APIs.getArticle(articleId);
        setVideoStatus(updated.video_status);
        setVideoPreview(resolveMediaUrl(updated.video) ?? "");
        if (updated.video_status === "ready" || updated.video_status === "failed") {
          window.clearInterval(interval);
          if (updated.video_status === "ready") {
            toast.success("الفيديو جاهز");
          } else {
            toast.error("فشل معالجة الفيديو");
          }
        }
      } catch {
        /* keep polling */
      }
    }, 5000);

    return () => window.clearInterval(interval);
  }, [articleId, mediaType, mediaUrl, videoStatus]);

  const handleFile = async (
    file: File,
    options?: { successMessage?: string },
  ) => {
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setOriginalFile(file);
    setUploading(true);
    try {
      const data = await ArticlesStaff_APIs.uploadCover(articleId, file);
      const uploadedPublicUrl = absoluteMediaUrlForApi(data.cover_url);
      setPublicCoverUrl(uploadedPublicUrl);

      const serverPreview = resolveMediaUrl(data.cover_url);
      if (serverPreview) {
        const loaded = await new Promise<boolean>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = serverPreview;
        });
        if (loaded) {
          URL.revokeObjectURL(localPreview);
          setPreview(serverPreview);
        }
      }

      toast.success(options?.successMessage ?? "تم رفع الصورة");
      setSearchResults([]);
      setReverseSearched(false);
      await refreshArticle();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleBlurredSave = async (file: File) => {
    setBlurMode(false);
    await handleFile(file, {
      successMessage: "تم حفظ ورفع النسخة المموّهة",
    });
  };

  const handleAudio = async (file: File) => {
    setUploadingAudio(true);
    try {
      const data = await ArticlesStaff_APIs.uploadSourceAudio(articleId, file);
      setAudioPreview(resolveMediaUrl(data.audio_url) ?? data.audio_url);
      toast.success("تم رفع الصوت المصدر");
      await refreshArticle();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleVideo = async (file: File) => {
    setUploadingVideo(true);
    try {
      const data = await ArticlesStaff_APIs.uploadVideo(articleId, file);
      setVideoStatus(data.video_status);
      toast.success(data.message ?? "جاري معالجة الفيديو...");
      await refreshArticle();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUploadingVideo(false);
    }
  };

  const deleteCover = async () => {
    try {
      await ArticlesStaff_APIs.deleteCover(articleId);
      setPreview("");
      setOriginalFile(null);
      setPublicCoverUrl(null);
      setSearchResults([]);
      setReverseSearched(false);
      toast.success("تم حذف الغلاف");
      await refreshArticle();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const deleteAudio = async () => {
    try {
      await ArticlesStaff_APIs.deleteSourceAudio(articleId);
      setAudioPreview("");
      toast.success("تم حذف الصوت المصدر");
      await refreshArticle();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const deleteVideo = async () => {
    try {
      await ArticlesStaff_APIs.deleteVideo(articleId);
      setVideoPreview("");
      setVideoStatus(null);
      toast.success("تم حذف الفيديو");
      await refreshArticle();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const saveMediaUrl = async () => {
    setSavingMediaUrl(true);
    try {
      await ArticlesStaff_APIs.updateArticle(articleId, {
        media_url: mediaUrl.trim() || null,
      });
      toast.success("تم حفظ رابط الوسائط");
      await refreshArticle();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSavingMediaUrl(false);
    }
  };

  const runReverseSearch = async (urlOverride?: string) => {
    const targetUrl = urlOverride ?? publicCoverUrl;
    if (!targetUrl) {
      toast.error(
        "ارفع صورة الغلاف وانتظر «تم رفع الصورة» — البحث العكسي يستخدم رابط الصورة على السيرفر",
      );
      return;
    }

    setSearching(true);
    setSearchResults([]);
    setReverseSearched(false);
    try {
      await runWithToolProcessing(setSearching, async () => {
        const data = await ImageVerification_APIs.reverseSearch(targetUrl);
        setSearchResults(data);
        setReverseSearched(true);
        if (data.length === 0) {
          toast.message("لا توجد نتائج مطابقة");
        }
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const runAiDetection = async () => {
    if (!originalFile && !preview) return;
    setAiResult(null);
    try {
      await runWithToolProcessing(setDetecting, async () => {
        const imageUrl = absoluteMediaUrlForApi(preview);
        const data = await ImageVerification_APIs.aiDetection({
          file: originalFile ?? undefined,
          imageUrl: !originalFile ? (imageUrl ?? undefined) : undefined,
        });
        setAiResult(data);
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const localArticle: StaffArticle = {
    ...article,
    cover_image: preview || article.cover_image,
    source_audio: audioPreview || article.source_audio,
    media_url: mediaUrl || article.media_url,
    video: videoPreview || article.video,
    video_status: videoStatus,
  };

  const canContinue = mediaStepComplete(localArticle);

  const coverSection = (
    <CoverUploadSection
      preview={preview}
      blurMode={blurMode}
      uploading={uploading}
      searching={searching}
      detecting={detecting}
      publicCoverUrl={publicCoverUrl}
      reverseSearched={reverseSearched}
      searchResults={searchResults}
      aiResult={aiResult}
      fileRef={fileRef}
      onBlurredSave={handleBlurredSave}
      onBlurModeChange={setBlurMode}
      onDeleteCover={deleteCover}
      onReverseSearch={runReverseSearch}
      onAiDetection={runAiDetection}
    />
  );

  return (
    <div className="space-y-6">
      <ToolProcessingDialog
        open={searching}
        title="جاري البحث العكسي"
        steps={REVERSE_IMAGE_PROCESSING_STEPS}
      />
      <ToolProcessingDialog
        open={detecting}
        title="جاري كشف الصورة"
        steps={AI_DETECTION_PROCESSING_STEPS}
      />

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <input
        ref={audioRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleAudio(file);
        }}
      />
      <input
        ref={videoRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleVideo(file);
        }}
      />

      {mediaType === "text" && coverSection}

      {mediaType === "audio" && (
        <>
          <div className="publish-flow-card">
            <p className="publish-flow-card__title">الصوت المصدر أو رابط SoundCloud</p>
            {audioPreview ? (
              <audio controls className="w-full" src={audioPreview} />
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => audioRef.current?.click()}
                disabled={uploadingAudio}
              >
                {uploadingAudio && <Loader2 className="size-4 animate-spin" />}
                رفع ملف صوتي
              </Button>
              {audioPreview && (
                <Button variant="outline" onClick={deleteAudio}>
                  <Trash2 className="size-4" />
                  حذف الصوت
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Label>أو رابط SoundCloud</Label>
              <div className="flex flex-wrap gap-2">
                <Input
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://soundcloud.com/..."
                  dir="ltr"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={saveMediaUrl}
                  disabled={savingMediaUrl}
                >
                  {savingMediaUrl && <Loader2 className="size-4 animate-spin" />}
                  حفظ
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">صورة الغلاف</p>
            {coverSection}
          </div>
        </>
      )}

      {mediaType === "video" && (
        <>
          <div className="publish-flow-card">
            <p className="publish-flow-card__title">الفيديو أو رابط YouTube</p>
            {videoStatus === "processing" && (
              <div className="flex items-center gap-2 rounded-lg border border-warning/40 bg-accent/40 p-3 text-sm">
                <Loader2 className="size-4 animate-spin" />
                جاري معالجة الفيديو...
              </div>
            )}
            {videoPreview && videoStatus === "ready" && (
              <video
                controls
                className="max-h-80 w-full rounded-xl"
                src={videoPreview}
                poster={resolveMediaUrl(article.video_poster) ?? undefined}
              />
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => videoRef.current?.click()}
                disabled={uploadingVideo || videoStatus === "processing"}
              >
                {uploadingVideo && <Loader2 className="size-4 animate-spin" />}
                رفع ملف فيديو
              </Button>
              {videoPreview && (
                <Button variant="outline" onClick={deleteVideo}>
                  <Trash2 className="size-4" />
                  حذف الفيديو
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Label>أو رابط YouTube</Label>
              <div className="flex flex-wrap gap-2">
                <Input
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://youtube.com/..."
                  dir="ltr"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={saveMediaUrl}
                  disabled={savingMediaUrl}
                >
                  {savingMediaUrl && <Loader2 className="size-4 animate-spin" />}
                  حفظ
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">صورة الغلاف</p>
            {coverSection}
          </div>
        </>
      )}

      <StepActionsRow onBack={onBack}>
        <NextStepButton onClick={onComplete} disabled={!canContinue} />
      </StepActionsRow>
    </div>
  );
}
