import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  runWithToolProcessing,
  ToolProcessingDialog,
} from "@/features/tools/components/ToolProcessingDialog";
import { getApiErrorMessage } from "@/lib/api-data";
import { LOCALIZATION_PROCESSING_STEPS } from "@/lib/tool-processing-steps";
import { ToolsEditorial_APIs } from "@/services/api/tools";
import type { StandaloneLocalizationResult } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import { ToolPageShell } from "./ToolPageShell";

export function LocalizationToolPage() {
  const [content, setContent] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<StandaloneLocalizationResult | null>(
    null,
  );

  const run = async () => {
    if (content.trim().length < 50) {
      toast.error("أدخل 50 حرفاً على الأقل");
      return;
    }
    setResult(null);
    try {
      await runWithToolProcessing(setProcessing, async () => {
        const data = await ToolsEditorial_APIs.localization({
          content: content.trim(),
        });
        if (!data.content_simplified.trim() && !data.content_dialect.trim()) {
          throw new Error("لم يُرجِع الخادم نصاً مبسّطاً أو باللهجة");
        }
        setResult(data);
        toast.success("تم إنشاء النسختين");
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("تم النسخ");
    } catch {
      toast.error("تعذّر النسخ");
    }
  };

  return (
    <ToolPageShell title="التبسيط واللهجة">
      <ToolProcessingDialog
        open={processing}
        title="جاري التوطين"
        steps={LOCALIZATION_PROCESSING_STEPS}
      />

      <Card>
        <CardContent className="space-y-4 p-6">
          <Textarea
            placeholder="الصق المحتوى (50 حرفاً على الأقل)..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
          />
          <Button onClick={() => void run()} disabled={processing}>
            تشغيل
          </Button>
        </CardContent>
      </Card>

      {result ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-2 p-6">
              <div className="flex items-center justify-between">
                <Label>النسخة المبسّطة</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void copy(result.content_simplified)}
                >
                  نسخ
                </Button>
              </div>
              <Textarea
                readOnly
                value={result.content_simplified}
                rows={6}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 p-6">
              <div className="flex items-center justify-between">
                <Label>النسخة باللهجة</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void copy(result.content_dialect)}
                >
                  نسخ
                </Button>
              </div>
              <Textarea readOnly value={result.content_dialect} rows={6} />
            </CardContent>
          </Card>
        </div>
      ) : null}
    </ToolPageShell>
  );
}
