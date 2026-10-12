import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CredibilityResultPanel } from "@/features/tools/components/CredibilityResultPanel";
import {
  runWithToolProcessing,
  ToolProcessingDialog,
} from "@/features/tools/components/ToolProcessingDialog";
import { getApiErrorMessage } from "@/lib/api";
import { CREDIBILITY_PROCESSING_STEPS } from "@/lib/publishing";
import { ToolsEditorial_APIs } from "@/services/api/tools";
import type { CredibilityCheckResult } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import { ToolPageShell } from "./ToolPageShell";

export function CredibilityCheckToolPage() {
  const [content, setContent] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<CredibilityCheckResult | null>(null);

  const run = async () => {
    const text = content.trim();
    if (text.length < 40) {
      toast.error("أدخل 40 حرفاً على الأقل");
      return;
    }
    setResult(null);
    try {
      await runWithToolProcessing(setProcessing, async () => {
        const check = await ToolsEditorial_APIs.credibilityCheck({
          content: text,
        });
        setResult(check);
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <ToolPageShell title="فحص المصداقية">
      <ToolProcessingDialog
        open={processing}
        title="جاري فحص المصداقية"
        steps={CREDIBILITY_PROCESSING_STEPS}
      />
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="credibility-content">نص التقرير</Label>
            <Textarea
              id="credibility-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={10}
              placeholder="الصق نص المقال لفحص الادعاءات"
            />
          </div>
          <Button type="button" onClick={() => void run()} disabled={processing}>
            {processing ? "جاري الفحص" : "فحص المصداقية"}
          </Button>
        </CardContent>
      </Card>
      {result ? <CredibilityResultPanel result={result} /> : null}
    </ToolPageShell>
  );
}
