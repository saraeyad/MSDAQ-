import { ToolProcessingDialog } from "@/features/tools/components/ToolProcessingDialog";
import {
  CREDIBILITY_PROCESSING_STEPS,
  STANDARDS_PROCESSING_STEPS,
} from "@/lib/publishing";
import { cn } from "@/lib/utils";
import type { AiCheckType } from "@/types";

const COPY: Record<
  AiCheckType,
  { title: string; description: string; steps: readonly string[] }
> = {
  credibility: {
    title: "جاري فحص المصداقية",
    description:
      "يتضمن الفحص البحث والتحقق من الادعاءات — قد يستغرق عدة عشرات من الثوانٍ. يُرجى الانتظار وعدم إغلاق الصفحة.",
    steps: [
      ...CREDIBILITY_PROCESSING_STEPS,
      "قد يستغرق الفحص دقيقة أو أكثر — لا تزال العملية جارية",
    ],
  },
  standards: {
    title: "جاري فحص المعايير",
    description:
      "جاري تقييم المحتوى وفق المعايير التحريرية — قد يستغرق الفحص بضع دقائق.",
    steps: STANDARDS_PROCESSING_STEPS,
  },
};

interface AiCheckProcessingDialogProps {
  open: boolean;
  type: AiCheckType;
  className?: string;
}

/** Modal loading UX for article AI checks (especially async credibility). */
export function AiCheckProcessingDialog({
  open,
  type,
  className,
}: AiCheckProcessingDialogProps) {
  const copy = COPY[type];

  return (
    <ToolProcessingDialog
      open={open}
      title={copy.title}
      description={copy.description}
      steps={copy.steps}
      className={cn("publish-flow-processing ai-check-processing", className)}
    />
  );
}
