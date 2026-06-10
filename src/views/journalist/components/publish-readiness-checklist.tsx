import { cn } from "@/lib/utils";
import { PUBLISH_TRUST_THRESHOLD } from "@/services/types/journalist-articles";
import type { PublishReadiness } from "@/types/journalist-article";
import { CheckCircle, Circle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PublishReadinessChecklistProps {
  readiness: PublishReadiness;
  className?: string;
}

export default function PublishReadinessChecklist({
  readiness,
  className,
}: PublishReadinessChecklistProps) {
  const { t } = useTranslation();
  const { gates } = readiness;

  const items = [
    {
      key: "fusha" as const,
      passed: gates.fusha.passed,
      label: t("journalist.editor.gates.fusha"),
      detail: gates.fusha.passed
        ? undefined
        : t("journalist.editor.gates.fushaFailed"),
    },
    {
      key: "trustScore" as const,
      passed: gates.trustScore.passed,
      label: t("journalist.editor.gates.trustScore"),
      detail: gates.trustScore.passed
        ? undefined
        : t("journalist.editor.gates.trustScoreFailed", {
            score: gates.trustScore.currentScore ?? 0,
            threshold: PUBLISH_TRUST_THRESHOLD,
          }),
    },
    {
      key: "hasSource" as const,
      passed: gates.hasSource.passed,
      label: t("journalist.editor.gates.hasSource"),
      detail: gates.hasSource.passed
        ? undefined
        : t("journalist.editor.gates.hasSourceFailed"),
    },
    {
      key: "humanConsent" as const,
      passed: gates.humanConsent.displayPassed ?? gates.humanConsent.passed,
      label: t("journalist.editor.gates.humanConsent"),
      detail: (() => {
        const shownPassed =
          gates.humanConsent.displayPassed ?? gates.humanConsent.passed;
        if (shownPassed) return undefined;
        if (gates.humanConsent.rejectedCount) {
          return t("journalist.editor.gates.humanConsentRejected", {
            count: gates.humanConsent.rejectedCount,
          });
        }
        if (gates.humanConsent.pendingCount) {
          return t("journalist.editor.gates.humanConsentPending", {
            count: gates.humanConsent.pendingCount,
          });
        }
        if (!gates.hasSource.passed) {
          return t("journalist.editor.gates.humanConsentNotYet");
        }
        return t("journalist.editor.gates.humanConsentFailed");
      })(),
    },
  ];

  return (
    <ul className={cn("space-y-2", className)}>
      {items.map((item) => (
        <li key={item.key} className="flex items-start gap-2 text-sm">
          {item.passed ? (
            <CheckCircle className="mt-0.5 size-4 shrink-0 text-green-600" />
          ) : (
            <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          )}
          <div>
            <span className={cn(item.passed ? "text-foreground" : "text-muted-foreground")}>
              {item.label}
            </span>
            {item.detail ? (
              <p className="text-xs text-muted-foreground">{item.detail}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
