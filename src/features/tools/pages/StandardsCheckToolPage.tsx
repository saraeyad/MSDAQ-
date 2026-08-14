import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  runWithToolProcessing,
  ToolProcessingDialog,
} from "@/features/tools/components/ToolProcessingDialog";
import { StandardsHighlightedText } from "@/features/tools/components/StandardsHighlightedText";
import { StandardsResultCard } from "@/features/tools/components/StandardsResultCard";
import { getStandardsCheckErrorMessage } from "@/lib/standards-errors";
import { STANDARDS_PROCESSING_STEPS } from "@/lib/tool-processing-steps";
import { ToolsEditorial_APIs } from "@/services/api/tools";
import type { StandardsCheckResult } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import { ToolPageShell } from "./ToolPageShell";

export function StandardsCheckToolPage() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<StandardsCheckResult | null>(null);

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
      toast.error(getStandardsCheckErrorMessage(err));
    }
  };

  return (
    <ToolPageShell title="فحص المعايير">
      <ToolProcessingDialog
        open={processing}
        title="جاري فحص المعايير"
        steps={STANDARDS_PROCESSING_STEPS}
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
        <>
          <StandardsResultCard
            result={result}
            title={title}
            content={content}
          />
          <StandardsHighlightedText
            title={title}
            content={content}
            criteria={result.criteria}
          />
        </>
      ) : null}
    </ToolPageShell>
  );
}
