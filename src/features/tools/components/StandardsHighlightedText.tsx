import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildHighlightedSegments, spansForBody, spansForHeadline } from "@/lib/standards-highlight";
import { cn } from "@/lib/utils";
import type { StandardsCriterion, StandardsSpanSeverity } from "@/types";

interface StandardsHighlightedTextProps {
  title?: string;
  content: string;
  criteria: StandardsCriterion[];
  className?: string;
}

function HighlightedBlock({
  text,
  spans,
  className,
}: {
  text: string;
  spans: Array<{ quote: string; reason: string; severity: StandardsSpanSeverity }>;
  className?: string;
}) {
  const segments = buildHighlightedSegments(text, spans);
  if (!text.trim()) return null;

  return (
    <div className={cn("standards-highlight-block", className)}>
      {segments.map((segment, index) =>
        segment.kind === "highlight" ? (
          <mark
            key={`${segment.text}-${index}`}
            className={cn(
              "standards-highlight",
              segment.severity
                ? `standards-highlight--${segment.severity}`
                : undefined,
            )}
          >
            {segment.text}
          </mark>
        ) : (
          <span key={`${segment.text}-${index}`}>{segment.text}</span>
        ),
      )}
    </div>
  );
}

export function StandardsHighlightedText({
  title = "",
  content,
  criteria,
  className,
}: StandardsHighlightedTextProps) {
  const headlineSpans = spansForHeadline(criteria);
  const bodySpans = spansForBody(criteria);
  const hasHighlights =
    (title.trim() && headlineSpans.length > 0) || bodySpans.length > 0;

  if (!hasHighlights) return null;

  return (
    <Card className={cn("standards-highlight-panel", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">التظليل في النص</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {title.trim() && headlineSpans.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">العنوان</p>
            <HighlightedBlock text={title} spans={headlineSpans} />
          </div>
        ) : null}
        {content.trim() && bodySpans.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">المحتوى</p>
            <HighlightedBlock text={content} spans={bodySpans} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
