import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToolProcessingDialog } from "@/features/tools/components/ToolProcessingDialog";
import {
  getSmartEditorByToolbarId,
  SMART_EDITOR_TOOLS,
  type SmartEditorToolbarId,
} from "@/features/tools/smart-editor/config";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SmartEditorToolbarProps {
  value: string;
  onApply: (text: string) => void;
  /** In publishing flow: one editor only — tools run on the article body. */
  embedded?: boolean;
}

export function SmartEditorToolbar({
  value,
  onApply,
  embedded = false,
}: SmartEditorToolbarProps) {
  const [selection, setSelection] = useState(value);
  const [result, setResult] = useState("");
  const [bullets, setBullets] = useState<string[]>([]);

  useEffect(() => {
    if (embedded) return;
    setSelection(value);
  }, [embedded, value]);

  const mutation = useMutation({
    mutationFn: async (toolbarId: SmartEditorToolbarId) => {
      const text = embedded ? value : selection || value;
      if (!text.trim()) {
        throw new Error(
          embedded
            ? "اكتب نص المقال أولاً في الحقل أعلاه"
            : "أدخل نصاً أولاً",
        );
      }
      const tool = getSmartEditorByToolbarId(toolbarId);
      const data = await tool.run(text);
      return { toolbarId, data };
    },
    onSuccess: ({ toolbarId, data }) => {
      if (toolbarId === "bullets" && data.bullets) {
        setBullets(data.bullets);
        setResult("");
      } else if (data.suggestion) {
        setResult(data.suggestion);
        setBullets([]);
      }
      toast.success("تم إنشاء الاقتراح");
    },
    onError: (err: Error) => toast.error(err.message || "فشلت الأداة"),
  });

  const activeToolId = mutation.isPending ? mutation.variables : null;
  const activeTool = activeToolId ? getSmartEditorByToolbarId(activeToolId) : null;

  const acceptSuggestion = (text: string) => {
    onApply(text);
    setResult("");
    setBullets([]);
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <ToolProcessingDialog
        open={mutation.isPending}
        title={activeTool ? `جاري تشغيل ${activeTool.label}` : "جاري المعالجة..."}
      />

      <div>
        <p className="text-sm font-medium">أدوات تحرير ذكية</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {embedded
            ? "تعمل على نص المقال في الحقل أعلاه — قبول الاقتراح يحدّث المقال."
            : "الصق أو اكتب النص، ثم اختر أداة."}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SMART_EDITOR_TOOLS.map((tool) => {
          const isRunning = activeToolId === tool.toolbarId;
          return (
            <Button
              key={tool.toolbarId}
              variant="outline"
              size="sm"
              disabled={mutation.isPending || (embedded && !value.trim())}
              onClick={() => mutation.mutate(tool.toolbarId)}
              className="gap-2"
            >
              {isRunning ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <tool.icon className="size-4" />
              )}
              {tool.label}
            </Button>
          );
        })}
      </div>

      {!embedded && (
        <Textarea
          placeholder="الصق النص المراد معالجته..."
          value={selection}
          onChange={(e) => setSelection(e.target.value)}
          rows={3}
        />
      )}

      {result && (
        <div className="space-y-2 rounded-lg border border-primary/20 bg-accent/40 p-3">
          <p className="text-sm font-medium">الاقتراح:</p>
          <p className="whitespace-pre-wrap text-sm">{result}</p>
          <Button size="sm" onClick={() => acceptSuggestion(result)}>
            {embedded ? "استبدال المقال بالاقتراح" : "قبول الاقتراح"}
          </Button>
        </div>
      )}

      {bullets.length > 0 && (
        <div className="space-y-2 rounded-lg border border-primary/20 bg-accent/40 p-3">
          <p className="text-sm font-medium">النقاط:</p>
          <ul className="list-disc space-y-1 ps-5 text-sm">
            {bullets.map((bullet, index) => (
              <li key={index}>{bullet}</li>
            ))}
          </ul>
          <Button size="sm" onClick={() => acceptSuggestion(bullets.join("\n"))}>
            {embedded ? "إدراج النقاط في المقال" : "قبول النقاط"}
          </Button>
        </div>
      )}
    </div>
  );
}
