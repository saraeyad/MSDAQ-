import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import type { DerivedPublishGate } from "@/types";

interface PublishGatePanelProps {
  gate?: DerivedPublishGate;
  isLoading?: boolean;
}

export function PublishGatePanel({ gate, isLoading }: PublishGatePanelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          جاري التحقق من شروط النشر...
        </CardContent>
      </Card>
    );
  }

  if (!gate) return null;

  return (
    <Card className={gate.can_publish ? "border-success/40" : "border-destructive/30"}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">بوابة النشر</h3>
          <span
            className={
              gate.can_publish ? "text-sm text-success" : "text-sm text-destructive"
            }
          >
            {gate.can_publish ? "جاهز للنشر" : "غير جاهز"}
          </span>
        </div>
        <ul className="space-y-2">
          {gate.checks.map((check) => (
            <li key={check.label} className="flex items-center gap-2 text-sm">
              {check.passed ? (
                <CheckCircle2
                  className={
                    check.blocking ? "size-4 text-success" : "size-4 text-muted-foreground"
                  }
                />
              ) : (
                <XCircle
                  className={
                    check.blocking ? "size-4 text-destructive" : "size-4 text-muted-foreground"
                  }
                />
              )}
              <span
                className={
                  check.blocking
                    ? check.passed
                      ? "gate-check-pass"
                      : "gate-check-fail"
                    : "text-muted-foreground"
                }
              >
                {check.label}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
