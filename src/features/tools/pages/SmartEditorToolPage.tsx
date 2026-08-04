import {
  getSmartEditorBySlug,
  type SmartEditorSlug,
} from "@/features/tools/smart-editor/config";
import {
  runWithToolProcessing,
  ToolProcessingDialog,
} from "@/features/tools/components/ToolProcessingDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { ToolPageShell } from "./ToolPageShell";

export type { SmartEditorSlug };

const SMART_EDITOR_STEPS: Record<SmartEditorSlug, readonly string[]> = {
  "fussha-rewriter": [
    "جاري قراءة النص...",
    "جاري إعادة الصياغة بالفصحى...",
    "جاري تحسين الصياغة...",
  ],
  "bias-neutralizer": [
    "جاري تحليل التحيز في النص...",
    "جاري تحييد الصياغة...",
    "جاري مراجعة النتيجة...",
  ],
  "discrimination-remover": [
    "جاري فحص التمييز في النص...",
    "جاري إعادة الصياغة...",
    "جاري إعداد النسخة المحايدة...",
  ],
  "bullet-points": [
    "جاري قراءة النص...",
    "جاري استخراج الأفكار الرئيسية...",
    "جاري ترتيب النقاط...",
  ],
};

interface SmartEditorToolPageProps {
  slug: SmartEditorSlug;
}

export function SmartEditorToolPage({ slug }: SmartEditorToolPageProps) {
  const config = getSmartEditorBySlug(slug);
  const [text, setText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [bullets, setBullets] = useState<string[]>([]);

  const run = async () => {
    if (text.trim().length < 5) {
      toast.error("أدخل 5 أحرف على الأقل");
      return;
    }

    setSuggestion("");
    setBullets([]);

    try {
      await runWithToolProcessing(setProcessing, async () => {
        const data = await config.run(text);
        if (slug === "bullet-points" && data.bullets) {
          setBullets(data.bullets);
        } else if (data.suggestion) {
          setSuggestion(data.suggestion);
        }
        toast.success("تم إنشاء الاقتراح");
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشلت الأداة");
    }
  };

  const applyResult = (value: string) => {
    setText(value);
    setSuggestion("");
    setBullets([]);
    toast.success("تم استبدال النص");
  };

  return (
    <ToolPageShell title={config.label}>
      <ToolProcessingDialog
        open={processing}
        title={`جاري تشغيل ${config.label}`}
        steps={SMART_EDITOR_STEPS[slug]}
      />

      <Card>
        <CardContent className="space-y-4 p-6">
          <p className="text-sm text-muted-foreground">
            الصق النص ثم اضغط «تشغيل» — هذه الصفحة مخصّصة لأداة {config.label}{" "}
            فقط.
          </p>
          <Textarea
            placeholder="الصق النص..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
          />
          <Button onClick={run} disabled={processing}>
            <config.icon className="size-4" />
            تشغيل {config.label}
          </Button>
        </CardContent>
      </Card>

      {suggestion && (
        <Card>
          <CardContent className="space-y-3 p-6">
            <p className="text-sm font-medium">الاقتراح:</p>
            <p className="whitespace-pre-wrap text-sm">{suggestion}</p>
            <Button size="sm" variant="outline" onClick={() => applyResult(suggestion)}>
              استبدال النص بالاقتراح
            </Button>
          </CardContent>
        </Card>
      )}

      {bullets.length > 0 && (
        <Card>
          <CardContent className="space-y-3 p-6">
            <p className="text-sm font-medium">النقاط:</p>
            <ul className="list-disc space-y-1 ps-5 text-sm">
              {bullets.map((bullet, index) => (
                <li key={index}>{bullet}</li>
              ))}
            </ul>
            <Button
              size="sm"
              variant="outline"
              onClick={() => applyResult(bullets.join("\n"))}
            >
              استبدال النص بالنقاط
            </Button>
          </CardContent>
        </Card>
      )}
    </ToolPageShell>
  );
}
