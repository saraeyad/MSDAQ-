import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  runWithToolProcessing,
  ToolProcessingDialog,
} from "@/features/tools/components/ToolProcessingDialog";
import { getApiErrorMessage } from "@/lib/api-data";
import { ToolsEditorial_APIs } from "@/services/api/tools";
import type { StandaloneStandardsResult } from "@/types";
import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ToolPageShell } from "./ToolPageShell";

const STANDARDS_STEPS = [
  "جاري قراءة المحتوى...",
  "جاري فحص المعايير التحريرية...",
  "جاري تقييم الفصحى...",
] as const;

export function StandardsCheckToolPage() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<StandaloneStandardsResult | null>(null);

  const run = async () => {
    if (content.trim().length < 50) {
      toast.error("أدخل 50 حرفاً على الأقل");
      return;
    }
    setResult(null);
    try {
      await runWithToolProcessing(setProcessing, async () => {
        const data = await ToolsEditorial_APIs.standardsCheck({
          content: content.trim(),
          title: title.trim() || undefined,
        });
        setResult(data);
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const breakdown = result?.breakdown ?? [];

  return (
    <ToolPageShell title="فحص المعايير">
      <ToolProcessingDialog
        open={processing}
        title="جاري فحص المعايير"
        steps={STANDARDS_STEPS}
      />

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <Label>العنوان (اختياري)</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان المقال"
            />
          </div>
          <Textarea
            placeholder="الصق المحتوى (50 حرفاً على الأقل)..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
          />
          <Button onClick={() => void run()} disabled={processing}>
            فحص
          </Button>
        </CardContent>
      </Card>

      {result ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-lg font-semibold">
                الدرجة: {result.total_score}
              </p>
              <span
                className={
                  result.fusha_passed ? "text-success" : "text-destructive"
                }
              >
                {result.fusha_passed ? "اجتاز الفصحى" : "لم يجتز الفصحى"}
              </span>
            </div>
            {breakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                لا تفاصيل معايير في الاستجابة.
              </p>
            ) : (
              <ul className="space-y-2">
                {breakdown.map((item, i) => (
                  <li
                    key={item.key ?? i}
                    className="flex items-start gap-2 rounded-lg border border-border p-3 text-sm"
                  >
                    {item.passed ? (
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                    ) : (
                      <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                    )}
                    <div>
                      <p className="font-medium">
                        {item.label ?? item.key}
                        {item.score != null ? ` (${item.score})` : ""}
                      </p>
                      {item.feedback ? (
                        <p className="text-muted-foreground">{item.feedback}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ) : null}
    </ToolPageShell>
  );
}
