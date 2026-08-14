import { isStepFilled, stepsForMediaType } from "@/lib/publish-gate";
import { cn } from "@/lib/utils";
import type { StaffArticle, StaffMediaType } from "@/types";
import { Check, Send } from "lucide-react";

interface PublishingStepperProps {
  currentStep: number;
  article: StaffArticle;
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
  article,
  mediaType = "text",
  onStepClick,
}: PublishingStepperProps) {
  const steps = stepsForMediaType(mediaType);

  return (
    <nav aria-label="خطوات النشر" className="publish-flow-stepper">
      <ol className="publish-flow-stepper__list">
        {steps.map((step, index) => {
          const displayNum = index + 1;
          const isLast = index === steps.length - 1;
          const isActive = step.num === currentStep;
          const isComplete = isStepFilled(step.num, article);

          return (
            <li
              key={step.num}
              className={cn(
                "publish-flow-stepper__item",
                isLast && "publish-flow-stepper__item--last",
              )}
            >
              <button
                type="button"
                disabled={!onStepClick}
                onClick={() => onStepClick?.(step.num)}
                title={step.label}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "publish-flow-stepper__step",
                  isLast && "publish-flow-stepper__step--last",
                )}
              >
                <span
                  className={cn(
                    "publish-flow-stepper__circle",
                    isComplete && "publish-flow-stepper__circle--done",
                    isActive && !isComplete && "publish-flow-stepper__circle--active",
                    !isActive && !isComplete && "publish-flow-stepper__circle--pending",
                    isLast && !isComplete && "publish-flow-stepper__circle--last",
                  )}
                >
                  {isComplete ? (
                    <Check className="size-4 stroke-[2.5]" aria-hidden />
                  ) : isLast ? (
                    <Send className="size-3.5" aria-hidden />
                  ) : (
                    displayNum
                  )}
                </span>
                <span
                  className={cn(
                    "publish-flow-stepper__label",
                    isActive && "publish-flow-stepper__label--active",
                    isComplete && "publish-flow-stepper__label--done",
                    isLast && "publish-flow-stepper__label--last",
                  )}
                >
                  {step.label}
                </span>
              </button>

              {index < steps.length - 1 && (
                <StepConnector completed={isComplete} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
