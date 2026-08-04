import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  runWithToolProcessing,
  ToolProcessingDialog,
} from "@/features/tools/components/ToolProcessingDialog";
import { ReverseSearchResults } from "@/features/tools/components/ReverseSearchResults";
import { absoluteMediaUrlForApi } from "@/lib/media-url";
import { getApiErrorMessage } from "@/lib/api-data";
import { ImageVerification_APIs } from "@/services/api/tools";
import type { ReverseSearchMatch } from "@/types";
import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ToolPageShell } from "./ToolPageShell";

const REVERSE_IMAGE_STEPS = [
  "جاري تحميل الصورة...",
  "جاري البحث في المصادر...",
  "جاري تجميع النتائج...",
] as const;

/** Public URL for reverse search — full http(s) or a storage path. */
function resolveSearchImageUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("storage/") ||
    trimmed.startsWith("storage\\")
  ) {
    return absoluteMediaUrlForApi(trimmed);
  }

  return null;
}

export function ReverseImageToolPage() {
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<ReverseSearchMatch[] | null>(null);

  const run = async () => {
    const resolvedUrl = resolveSearchImageUrl(imageUrl);

    if (!file && !resolvedUrl) {
      toast.error(
        file || imageUrl.trim()
          ? "أدخل رابطاً يبدأ بـ https:// أو ارفع ملف صورة"
          : "اختر صورة أو أدخل رابطاً عاماً",
      );
      return;
    }

    setResults(null);
    try {
      await runWithToolProcessing(setProcessing, async () => {
        const data = await ImageVerification_APIs.reverseSearch({
          file: file ?? undefined,
          imageUrl: !file ? (resolvedUrl ?? undefined) : undefined,
        });
        setResults(data);
        if (data.length === 0) {
          toast.message("لا توجد نتائج مطابقة");
        }
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <ToolPageShell title="بحث عكسي عن الصور">
      <ToolProcessingDialog
        open={processing}
        title="جاري البحث العكسي"
        steps={REVERSE_IMAGE_STEPS}
      />

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="reverse-image-file">رفع صورة</Label>
            <Input
              id="reverse-image-file"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reverse-image-url">أو رابط صورة عامة</Label>
            <Input
              id="reverse-image-url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground">
              يجب أن يكون الرابط عاماً ويمكن الوصول إليه مباشرة (مثل رابط صورة
              منشور أو من التخزين).
            </p>
          </div>
          <Button onClick={() => void run()} disabled={processing}>
            <Search className="size-4" />
            بحث
          </Button>
        </CardContent>
      </Card>

      {results !== null ? <ReverseSearchResults results={results} /> : null}
    </ToolPageShell>
  );
}
