import { CoverBlurEditor } from "@/features/publishing-flow/components/cover-blur-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ScoreDonut,
  labelFromAiVerdict,
  toneFromAiVerdict,
} from "@/features/tools/components/ScoreDonut";
import { ReverseSearchResults } from "@/features/tools/components/ReverseSearchResults";
import { getToolBySlug } from "@/features/tools/tool-config";

const REVERSE_IMAGE_LABEL =
  getToolBySlug("reverse-image")?.label ?? "بحث عكسي عن الصور";
const AI_DETECTION_LABEL =
  getToolBySlug("ai-detection")?.label ?? "كشف الصور بالذكاء الاصطناعي";
import type { AiDetectionResult, ReverseSearchMatch } from "@/types";
import { Loader2, Search, Shield, Trash2, Upload } from "lucide-react";
import type { RefObject } from "react";

interface CoverUploadSectionProps {
  preview: string;
  blurMode: boolean;
  uploading: boolean;
  searching: boolean;
  detecting: boolean;
  publicCoverUrl: string | null;
  reverseSearched: boolean;
  searchResults: ReverseSearchMatch[];
  aiResult: AiDetectionResult | null;
  fileRef: RefObject<HTMLInputElement | null>;
  onBlurredSave: (file: File) => Promise<void>;
  onBlurModeChange: (value: boolean) => void;
  onDeleteCover: () => Promise<void>;
  onReverseSearch: () => Promise<void>;
  onAiDetection: () => Promise<void>;
}

export function CoverUploadSection({
  preview,
  blurMode,
  uploading,
  searching,
  detecting,
  publicCoverUrl,
  reverseSearched,
  searchResults,
  aiResult,
  fileRef,
  onBlurredSave,
  onBlurModeChange,
  onDeleteCover,
  onReverseSearch,
  onAiDetection,
}: CoverUploadSectionProps) {
  if (!preview) {
    return (
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border py-16 transition-colors hover:border-primary/50"
      >
        <Upload className="size-10 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">ارفع صورة الغلاف</span>
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {blurMode ? (
        <CoverBlurEditor
          imageSrc={preview}
          onSave={onBlurredSave}
          onCancel={() => onBlurModeChange(false)}
          saving={uploading}
        />
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt=""
            className="max-h-80 w-full rounded-xl object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/50">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          )}
        </div>
      )}

      {!blurMode && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            استبدال
          </Button>
          <Button variant="outline" size="sm" onClick={() => void onDeleteCover()}>
            <Trash2 className="size-4" />
            حذف
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void onReverseSearch()}
            disabled={searching || uploading || !publicCoverUrl}
          >
            {searching ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            {REVERSE_IMAGE_LABEL}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void onAiDetection()}
            disabled={detecting}
          >
            {detecting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Shield className="size-4" />
            )}
            {AI_DETECTION_LABEL}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBlurModeChange(true)}
            disabled={!preview || uploading}
          >
            أداة التمويه
          </Button>
        </div>
      )}

      {reverseSearched ? <ReverseSearchResults results={searchResults} /> : null}

      {aiResult && (
        <Card>
          <CardContent className="p-4">
            <ScoreDonut
              value={
                aiResult.confidence_score <= 1
                  ? aiResult.confidence_score * 100
                  : aiResult.confidence_score
              }
              max={100}
              format="percent"
              size="md"
              tone={toneFromAiVerdict(aiResult.verdict)}
              label={labelFromAiVerdict(aiResult.verdict)}
              caption="مستوى الثقة"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
