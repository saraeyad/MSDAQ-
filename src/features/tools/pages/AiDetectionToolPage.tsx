import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileInput } from "@/components/ui/file-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  runWithToolProcessing,
  ToolProcessingDialog,
} from "@/features/tools/components/ToolProcessingDialog";
import { getApiErrorMessage } from "@/lib/api-data";
import {
  AI_DETECTION_PROCESSING_STEPS,
  resolveToolImageUrl,
} from "@/lib/tool-processing-steps";
import { ImageVerification_APIs } from "@/services/api/tools";
import type { AiDetectionResult } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import {
  ScoreDonut,
  labelFromAiVerdict,
  toneFromAiVerdict,
} from "@/features/tools/components/ScoreDonut";
import { ToolPageShell } from "./ToolPageShell";

export function AiDetectionToolPage() {
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<AiDetectionResult | null>(null);

  const run = async () => {
    const resolvedUrl = resolveToolImageUrl(imageUrl);

    if (!file && !resolvedUrl) {
      toast.error(
        imageUrl.trim()
          ? "أدخل رابطاً يبدأ بـ https:// أو ارفع ملف صورة"
          : "اختر صورة أو أدخل رابطاً",
      );
      return;
    }

    setResult(null);
    try {
      await runWithToolProcessing(setProcessing, async () => {
        const data = await ImageVerification_APIs.aiDetection({
          file: file ?? undefined,
          imageUrl: !file ? (resolvedUrl ?? undefined) : undefined,
        });
        setResult(data);
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <ToolPageShell title="كشف الصور بالذكاء الاصطناعي">
      <ToolProcessingDialog
        open={processing}
        title="جاري كشف الصورة"
        steps={AI_DETECTION_PROCESSING_STEPS}
      />

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="ai-detect-file">رفع صورة</Label>
            <FileInput
              id="ai-detect-file"
              accept="image/*"
              value={file}
              onChange={setFile}
              chooseLabel="اختر صورة"
              emptyLabel="اسحب أو انقر للرفع"
            />
          </div>
          <Input
            placeholder="أو أدخل رابط الصورة"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            dir="ltr"
          />
          <Button onClick={() => void run()} disabled={processing}>
            تشغيل
          </Button>
        </CardContent>
      </Card>

      {result ? (
        <Card>
          <CardContent className="p-6">
            <ScoreDonut
              value={
                result.confidence_score <= 1
                  ? result.confidence_score * 100
                  : result.confidence_score
              }
              max={100}
              format="percent"
              size="md"
              tone={toneFromAiVerdict(result.verdict)}
              label={labelFromAiVerdict(result.verdict)}
              caption="نسبة توليدها بالذكاء الاصطناعي"
            />
          </CardContent>
        </Card>
      ) : null}
    </ToolPageShell>
  );
}
