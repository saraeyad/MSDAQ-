import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolProcessingDialog } from "@/features/tools/components/ToolProcessingDialog";
import type { SmartEditorReviewTool } from "@/features/tools/smart-editor/config";
import { getApiErrorMessage } from "@/lib/api-data";
import { buildHighlightedSegments } from "@/lib/standards-highlight";
import { cn } from "@/lib/utils";
import type { EditorialReviewSpan } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function spanKey(span: EditorialReviewSpan, index: number): string {
  return `${index}:${span.quote}:${span.reason}`;
}

interface EditorialReviewPanelProps {
  tool: SmartEditorReviewTool;
  text: string;
  onApply: (suggestion: string) => void;
  onDismiss?: () => void;
  embedded?: boolean;
}

export function EditorialReviewPanel({
  tool,
  text,
  onApply,
  onDismiss,
  embedded = false,
}: EditorialReviewPanelProps) {
  const [detectText] = useState(text);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [suggestion, setSuggestion] = useState("");
  const [rewrittenSpans, setRewrittenSpans] = useState<EditorialReviewSpan[]>([]);

  const detectQuery = useQuery({
    queryKey: ["editorial-detect", tool.slug, detectText],
    queryFn: () => tool.detect(detectText),
    enabled: detectText.trim().length > 0,
    retry: false,
    staleTime: 30_000,
  });

  const spans = detectQuery.data?.spans ?? [];
  const toastId = `editorial-detect-${tool.slug}`;

  useEffect(() => {
    if (detectQuery.isFetching) return;

    if (detectQuery.isSuccess) {
      const nextSpans = detectQuery.data?.spans ?? [];
      setSelectedKeys(
        new Set(nextSpans.map((span, index) => spanKey(span, index))),
      );
      toast.success(
        nextSpans.length === 0
          ? "لم يُكتشف أي مشكلة في النص"
          : `تم العثور على ${nextSpans.length} مقطع`,
        { id: toastId },
      );
      return;
    }

    if (detectQuery.isError) {
      toast.error(getApiErrorMessage(detectQuery.error), { id: toastId });
    }
  }, [
    detectQuery.data,
    detectQuery.dataUpdatedAt,
    detectQuery.error,
    detectQuery.errorUpdatedAt,
    detectQuery.isError,
    detectQuery.isFetching,
    detectQuery.isSuccess,
    toastId,
  ]);

  const rewriteMutation = useMutation({
    mutationFn: () => {
      const selectedSpans = spans
        .map((span, index) => ({ span, index }))
        .filter(({ span, index }) => selectedKeys.has(spanKey(span, index)))
        .map(({ span }) => ({ quote: span.quote, reason: span.reason }));

      if (selectedSpans.length === 0) {
        throw new Error("اختر مقطعاً واحداً على الأقل لإعادة الصياغة");
      }

      return tool.rewrite(detectText, selectedSpans).then((data) => ({
        data,
        rewritten: spans.filter((span, index) =>
          selectedKeys.has(spanKey(span, index)),
        ),
      }));
    },
    onSuccess: ({ data, rewritten }) => {
      if (data.suggestion) {
        setRewrittenSpans(rewritten);
        setSuggestion(data.suggestion);
        toast.success("تم إعداد الاقتراح — راجعه قبل التطبيق");
      }
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const selectedCount = selectedKeys.size;
  const allSelected = spans.length > 0 && selectedCount === spans.length;

  const toggleSpan = (span: EditorialReviewSpan, index: number) => {
    const key = spanKey(span, index);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedKeys(new Set(spans.map((span, index) => spanKey(span, index))));
    } else {
      setSelectedKeys(new Set());
    }
  };

  const highlightedSegments = useMemo(
    () => buildHighlightedSegments(detectText, spans),
    [detectText, spans],
  );

  const removedSegments = useMemo(
    () => buildHighlightedSegments(detectText, rewrittenSpans),
    [detectText, rewrittenSpans],
  );

  const renderHighlightedText = (
    segments: ReturnType<typeof buildHighlightedSegments>,
    spanSource: EditorialReviewSpan[],
    removed = false,
  ) =>
    segments.map((segment, index) =>
      segment.kind === "highlight" ? (
        <mark
          key={`${segment.text}-${index}`}
          title={spanSource.find((s) => s.quote === segment.text)?.reason}
          className={cn(
            "standards-highlight cursor-help",
            removed && "editorial-review-removed",
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
    );

  const handleApply = () => {
    if (!suggestion) return;
    onApply(suggestion);
    onDismiss?.();
  };

  const handleReject = () => {
    setSuggestion("");
    setRewrittenSpans([]);
  };

  const handleReset = () => {
    onDismiss?.();
  };

  const isBusy = detectQuery.isFetching || rewriteMutation.isPending;
  const showDetectionView = detectQuery.isSuccess && !suggestion;

  return (
    <div className="editorial-review-panel space-y-4 rounded-xl border border-border bg-card p-4">
      <ToolProcessingDialog
        open={detectQuery.isFetching}
        title={`جاري ${tool.detectLabel}`}
      />
      <ToolProcessingDialog
        open={rewriteMutation.isPending}
        title={`جاري ${tool.rewriteLabel}`}
      />

      {detectQuery.isError && !suggestion ? (
        <Button size="sm" variant="ghost" onClick={handleReset}>
          إغلاق
        </Button>
      ) : null}

      {showDetectionView ? (
        <>
          <div className="flex flex-wrap gap-2">
            {spans.length > 0 ? (
              <Button
                size="sm"
                disabled={isBusy || selectedCount === 0}
                onClick={() => rewriteMutation.mutate()}
              >
                {rewriteMutation.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                {tool.rewriteLabel}
                {selectedCount > 0 ? ` (${selectedCount})` : ""}
              </Button>
            ) : null}
            <Button
              size="sm"
              variant="ghost"
              disabled={isBusy}
              onClick={handleReset}
            >
              إغلاق
            </Button>
          </div>

          {spans.length === 0 ? (
            <div className="editorial-review-empty flex items-start gap-3 rounded-lg border border-success/30 bg-success/10 p-4">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
              <div>
                <p className="text-sm font-medium">لم يُكتشف أي مشكلة</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  النص يبدو نظيفاً من هذه الزاوية — لا حاجة لإعادة صياغة.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  النص مع التظليل
                </p>
                <div className="standards-highlight-block editorial-review-highlight max-h-48 overflow-y-auto rounded-lg border border-border bg-muted/20 p-3 text-sm leading-relaxed">
                  {renderHighlightedText(highlightedSegments, spans)}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    المقاطع المكتشفة ({spans.length})
                  </p>
                  <label className="flex cursor-pointer items-center gap-2 text-xs">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(v) => toggleAll(v === true)}
                    />
                    تحديد الكل
                  </label>
                </div>
                <ul className="editorial-review-span-list space-y-2">
                  {spans.map((span, index) => {
                    const key = spanKey(span, index);
                    const checked = selectedKeys.has(key);
                    return (
                      <li
                        key={key}
                        className={cn(
                          "editorial-review-span-item rounded-lg border p-3",
                          checked
                            ? "border-primary/40 bg-accent/30"
                            : "border-border bg-muted/10",
                        )}
                      >
                        <label className="flex cursor-pointer items-start gap-3">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleSpan(span, index)}
                            className="mt-0.5"
                          />
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={cn(
                                  "editorial-review-span-item__severity rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                                  `editorial-review-span-item__severity--${span.severity}`,
                                )}
                              >
                                {span.severity}
                              </span>
                              <q className="text-sm font-medium">{span.quote}</q>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {span.reason}
                            </p>
                          </div>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </>
          )}
        </>
      ) : null}

      {suggestion ? (
        <div className="editorial-review-compare space-y-3 rounded-lg border border-primary/20 bg-accent/40 p-4">
          <p className="text-sm font-medium">الاقتراح (قبل / بعد):</p>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">الأصل</p>
              <div className="standards-highlight-block editorial-review-highlight max-h-56 overflow-y-auto whitespace-pre-wrap rounded-md border bg-background p-3 text-xs leading-relaxed">
                {renderHighlightedText(removedSegments, rewrittenSpans, true)}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">
                المقترح
              </p>
              <p className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-md border border-primary/30 bg-background p-3 text-xs leading-relaxed">
                {suggestion}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleApply}>
              {embedded ? "تطبيق على المقال" : "تطبيق"}
            </Button>
            <Button size="sm" variant="outline" onClick={handleReject}>
              رفض
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
