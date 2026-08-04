import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImageVerification_APIs } from "@/services/api/tools";
import type { AiDetectionResult } from "@/types";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ToolPageShell } from "./ToolPageShell";

export function AiDetectionToolPage() {
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiDetectionResult | null>(null);

  const run = async () => {
    if (!file && !imageUrl.trim()) {
      toast.error("اختر صورة أو أدخل رابطاً");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await ImageVerification_APIs.aiDetection({
        file: file ?? undefined,
        imageUrl: imageUrl.trim() || undefined,
      });
      setResult(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل كشف الذكاء الاصطناعي");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPageShell title="كشف الصور بالذكاء الاصطناعي">
      <Card>
        <CardContent className="space-y-4 p-6">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <Input
            placeholder="أو أدخل رابط الصورة"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            dir="ltr"
          />
          <Button onClick={run} disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            تشغيل
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="space-y-1 p-6 text-sm">
            <p>الحكم: {result.verdict}</p>
            <p>الثقة: {(result.confidence_score * 100).toFixed(0)}%</p>
          </CardContent>
        </Card>
      )}
    </ToolPageShell>
  );
}
