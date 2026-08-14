import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  runWithToolProcessing,
  ToolProcessingDialog,
} from "@/features/tools/components/ToolProcessingDialog";
import { getApiErrorMessage } from "@/lib/api-data";
import { CREDIBILITY_PROCESSING_STEPS } from "@/lib/tool-processing-steps";
import { ToolsEditorial_APIs } from "@/services/api/tools";
import type { StandaloneCredibilityResult } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import { ScoreDonut } from "@/features/tools/components/ScoreDonut";
import { ToolPageShell } from "./ToolPageShell";

export function CredibilityCheckToolPage() {
  const [content, setContent] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<StandaloneCredibilityResult | null>(null);

  const run = async () => {
    const len = content.trim().length;
    if (len < 50 || len > 20000) {
      toast.error("أدخل بين 50 و 20000 حرفاً");
      return;
    }
    setResult(null);
    try {
      await runWithToolProcessing(setProcessing, async () => {
        const data = await ToolsEditorial_APIs.credibilityCheck({
          content: content.trim(),
        });
        setResult(data);
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
          <Textarea
            placeholder="الصق المحتوى (50–20000 حرف)..."
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
          <CardContent className="p-6">
            <ScoreDonut
              value={result.credibility_score}
              max={100}
              format="percent"
              size="md"
              label="درجة المصداقية"
            />
            {/* Standalone API returns score only; article flow includes claim details. */}
          </CardContent>
        </Card>
      ) : null}
    </ToolPageShell>
  );
}
