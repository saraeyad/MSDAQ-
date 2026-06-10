import { cn } from "@/lib/utils";

interface JournalistApplyStepsProps {
  currentStep: number;
  totalSteps: number;
}

export default function JournalistApplySteps({
  currentStep,
  totalSteps,
}: JournalistApplyStepsProps) {
  return (
    <div className="journalist-apply-steps">
      {Array.from({ length: totalSteps }, (_, index) => {
        const step = index + 1;
        const isActive = step === currentStep;
        const isComplete = step < currentStep;

        return (
          <div
            key={step}
            className={cn(
              "journalist-apply-step",
              isActive && "journalist-apply-step-active",
              isComplete && "journalist-apply-step-complete",
            )}
          >
            <span className="journalist-apply-step-number">{step}</span>
          </div>
        );
      })}
    </div>
  );
}
