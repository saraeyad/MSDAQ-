import { Button } from "@/components/ui/button";
import { NextStepButton } from "@/features/publishing-flow/components/NextStepButton";
import { StepActionsRow } from "@/features/publishing-flow/components/StepActionsRow";
import {
  runWithToolProcessing,
  ToolProcessingDialog,
} from "@/features/tools/components/ToolProcessingDialog";
import { StandardsHighlightedText } from "@/features/tools/components/StandardsHighlightedText";
import { StandardsResultCard } from "@/features/tools/components/StandardsResultCard";
import { getStandardsCheckErrorMessage } from "@/lib/standards-errors";
import { STANDARDS_PROCESSING_STEPS } from "@/lib/tool-processing-steps";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import type { StandardsCheckResult } from "@/types";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Step4StandardsProps {
  articleId: number;
  title?: string;
  contentFormal?: string | null;
  onComplete: () => void;
  onBack?: () => void;
}

export function Step4Standards({
  articleId,
  title = "",
  contentFormal = "",
  onComplete,
  onBack,
}: Step4StandardsProps) {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<StandardsCheckResult | null>(null);
  const body = contentFormal ?? "";

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
      toast.error(getStandardsCheckErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <ToolProcessingDialog
        open={processing}
        title="جاري فحص المعايير"
        steps={STANDARDS_PROCESSING_STEPS}
        className="publish-flow-processing"
      />

      <p className="text-muted-foreground">
        يجب اجتياز فحص المعايير التحريرية والفصحى قبل المتابعة.
      </p>
      <Button onClick={() => void runCheck()} disabled={processing}>
        تشغيل فحص المعايير
      </Button>

      {result ? (
        <>
          <StandardsResultCard
            result={result}
            title={title}
            content={body}
          />
          <StandardsHighlightedText
            title={title}
            content={body}
            criteria={result.criteria}
          />
        </>
      ) : null}

      <StepActionsRow onBack={onBack}>
        <NextStepButton onClick={onComplete} />
      </StepActionsRow>
    </div>
  );
}
