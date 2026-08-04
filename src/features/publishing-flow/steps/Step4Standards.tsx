import { Button } from "@/components/ui/button";
import { NextStepButton } from "@/features/publishing-flow/components/NextStepButton";
import { StepActionsRow } from "@/features/publishing-flow/components/StepActionsRow";
import { Card, CardContent } from "@/components/ui/card";
import {
  runWithToolProcessing,
  ToolProcessingDialog,
} from "@/features/tools/components/ToolProcessingDialog";
import { getApiErrorMessage } from "@/lib/api-data";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import type { StandardsCheckResult } from "@/types";
import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const STANDARDS_STEPS = [
  "جاري قراءة المحتوى...",
  "جاري فحص المعايير التحريرية...",
  "جاري تقييم الفصحى...",
] as const;

interface Step4StandardsProps {
  articleId: number;
  onComplete: () => void;
}

export function Step4Standards({ articleId, onComplete }: Step4StandardsProps) {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<StandardsCheckResult | null>(null);

  const runCheck = async () => {
    try {
      await runWithToolProcessing(setProcessing, async () => {
        const data = await ArticlesStaff_APIs.standardsCheck(articleId);
        setResult(data);
        await queryClient.invalidateQueries({
          queryKey: ["staff-article", String(articleId)],
        });
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <ToolProcessingDialog
        open={processing}
        title="جاري فحص المعايير"
        steps={STANDARDS_STEPS}
      />

      <p className="text-muted-foreground">
        يجب اجتياز فحص المعايير التحريرية والفصحى قبل المتابعة.
      </p>
      <Button onClick={runCheck} disabled={processing}>
        تشغيل فحص المعايير
      </Button>

      {result && (
        <Card
          className={
            result.fusha_passed ? "border-success/40" : "border-destructive/30"
          }
        >
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                {result.fusha_passed ? (
                  <>
                    <CheckCircle2 className="size-5 text-success" />
                    اجتاز الفحص
                  </>
                ) : (
                  <>
                    <XCircle className="size-5 text-destructive" />
                    لم يجتز الفحص
                  </>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {result.total_score} / {result.max_score}
              </span>
            </div>
            <div className="space-y-2">
              {(result.criteria ?? []).map((c) => (
                <div
                  key={c.key}
                  className="rounded-lg border border-border p-3 text-sm"
                >
                  <div className="flex items-center justify-between font-medium">
                    <span>{c.label}</span>
                    {c.score != null && (
                      <span>
                        {c.score}/{c.max}
                      </span>
                    )}
                    {c.passed != null && (
                      <span
                        className={
                          c.passed ? "text-success" : "text-destructive"
                        }
                      >
                        {c.passed ? "نجح" : "فشل"}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-muted-foreground">{c.feedback}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <StepActionsRow>
        <NextStepButton onClick={onComplete} disabled={!result?.fusha_passed} />
      </StepActionsRow>
    </div>
  );
}
