import { Card, CardContent } from "@/components/ui/card";
import { sourceDisplayName } from "@/lib/publish-gate";
import { Shield } from "lucide-react";
import type { ArticleSource } from "@/types";

interface SourceConsentBannerProps {
  sources?: ArticleSource[];
}

export function SourceConsentBanner({ sources }: SourceConsentBannerProps) {
  const personSources = (sources ?? []).filter(
    (source) => source.source_type === "person",
  );
  if (personSources.length === 0) return null;

  const pending = personSources.filter(
    (source) => source.consent_status === "pending",
  );
  const rejected = personSources.filter(
    (source) => source.consent_status === "rejected",
  );

  if (pending.length === 0 && rejected.length === 0) return null;

  return (
    <Card className="border-warning/40 bg-accent/50">
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center gap-2 font-semibold">
          <Shield className="size-4 text-warning" />
          موافقة المصادر (واتساب)
        </div>
        {pending.length > 0 && (
          <p className="text-sm text-muted-foreground">
            في انتظار الموافقة:{" "}
            {pending.map((source) => sourceDisplayName(source)).join("، ")}
          </p>
        )}
        {rejected.length > 0 && (
          <p className="text-sm text-destructive">
            مرفوض: {rejected.map((source) => sourceDisplayName(source)).join("، ")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
