import { stepsForMediaType } from "@/lib/publish-gate";
import { cn } from "@/lib/utils";
import type { StaffMediaType } from "@/types";
import { Check } from "lucide-react";

interface PublishingStepperProps {
  currentStep: number;
  maxAllowedStep: number;
  mediaType?: StaffMediaType;
  onStepClick?: (step: number) => void;
}

function StepConnector({ completed }: { completed: boolean }) {
  return (
    <div
      className={cn(
        "publish-flow-stepper__connector",
        completed && "publish-flow-stepper__connector--done",
      )}
      aria-hidden
    />
  );
}

export function PublishingStepper({
  currentStep,
  maxAllowedStep,
  mediaType = "text",
  onStepClick,
}: PublishingStepperProps) {
  const steps = stepsForMediaType(mediaType);
  const currentIndex = steps.findIndex((s) => s.num === currentStep);

  return (
    <nav aria-label="خطوات النشر" className="publish-flow-stepper">
      <ol className="publish-flow-stepper__list">
        {steps.map((step, index) => {
          const displayNum = index + 1;
          const isActive = step.num === currentStep;
          const isComplete = currentIndex > index;
          const isReachable = step.num <= maxAllowedStep;

          return (
            <li key={step.num} className="publish-flow-stepper__item">
              <button
                type="button"
                disabled={!onStepClick || !isReachable}
                onClick={() => onStepClick?.(step.num)}
                title={step.label}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "publish-flow-stepper__step",
                  !isReachable && "publish-flow-stepper__step--locked",
                )}
              >
                <span
                  className={cn(
                    "publish-flow-stepper__circle",
                    isComplete && "publish-flow-stepper__circle--done",
                    isActive && "publish-flow-stepper__circle--active",
                    !isActive && !isComplete && "publish-flow-stepper__circle--pending",
                  )}
                >
                  {isComplete ? (
                    <Check className="size-4 stroke-[2.5]" aria-hidden />
                  ) : (
                    displayNum
                  )}
                </span>
                <span
                  className={cn(
                    "publish-flow-stepper__label",
                    isActive && "publish-flow-stepper__label--active",
                    isComplete && "publish-flow-stepper__label--done",
                  )}
                >
                  {step.label}
                </span>
              </button>

              {index < steps.length - 1 && (
                <StepConnector completed={currentIndex > index} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export { stepsForMediaType as STEPS };
