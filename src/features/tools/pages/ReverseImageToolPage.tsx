import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileInput } from "@/components/ui/file-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  runWithToolProcessing,
  ToolProcessingDialog,
} from "@/features/tools/components/ToolProcessingDialog";
import { ReverseSearchResults } from "@/features/tools/components/ReverseSearchResults";
import { getApiErrorMessage } from "@/lib/api-data";
import {
  REVERSE_IMAGE_PROCESSING_STEPS,
  resolveToolImageUrl,
} from "@/lib/tool-processing-steps";
import { ImageVerification_APIs } from "@/services/api/tools";
import type { ReverseSearchMatch } from "@/types";
import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ToolPageShell } from "./ToolPageShell";

export function ReverseImageToolPage() {
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [publicImageUrl, setPublicImageUrl] = useState<string | null>(null);
  const [tempLibraryId, setTempLibraryId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<ReverseSearchMatch[] | null>(null);

  const handleFile = async (next: File | null) => {
    if (tempLibraryId) {
      void ImageVerification_APIs.discardTempImage(tempLibraryId);
      setTempLibraryId(null);
    }
    setFile(next);
    setPublicImageUrl(null);
    setResults(null);
    if (!next) return;

    setUploading(true);
    try {
      const uploaded = await ImageVerification_APIs.uploadPublicImage(next);
      setPublicImageUrl(uploaded.url);
      setTempLibraryId(uploaded.libraryId);
    } catch (err) {
      setFile(null);
      toast.error(getApiErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const run = async () => {
    const targetUrl =
      publicImageUrl ?? resolveToolImageUrl(imageUrl);

    if (!targetUrl) {
      toast.error(
        file || uploading
          ? "انتظر حتى يكتمل رفع الصورة — البحث العكسي يستخدم رابط الصورة على السيرفر"
          : imageUrl.trim()
            ? "أدخل رابطاً يبدأ بـ https:// أو ارفع ملف صورة"
            : "ارفع صورة وانتظر «تم رفع الصورة»، أو أدخل رابطاً عاماً",
      );
      return;
    }

    setResults(null);
    try {
      await runWithToolProcessing(setProcessing, async () => {
        const data = await ImageVerification_APIs.reverseSearch(targetUrl);
        setResults(data);
        if (data.length === 0) {
          toast.message("لا توجد نتائج مطابقة");
        }
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      if (tempLibraryId) {
        await ImageVerification_APIs.discardTempImage(tempLibraryId);
        setTempLibraryId(null);
      }
    }
  };

  const busy = processing || uploading;
  const canSearch = Boolean(publicImageUrl || resolveToolImageUrl(imageUrl));

  return (
    <ToolPageShell title="بحث عكسي عن الصور">
      <ToolProcessingDialog
        open={processing || uploading}
        title={uploading ? "جاري رفع الصورة" : "جاري البحث العكسي"}
        steps={
          uploading
            ? ["جاري رفع الصورة...", "جاري تجهيز الرابط العام..."]
            : REVERSE_IMAGE_PROCESSING_STEPS
        }
      />

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="reverse-image-file">رفع صورة</Label>
            <FileInput
              id="reverse-image-file"
              accept="image/*"
              value={file}
              onChange={(next) => void handleFile(next)}
              disabled={busy}
              chooseLabel="اختر صورة"
              emptyLabel="اسحب أو انقر للرفع"
            />
            {publicImageUrl ? (
              <p className="text-xs text-success">تم رفع الصورة — جاهزة للبحث</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="reverse-image-url">أو رابط صورة عامة</Label>
            <Input
              id="reverse-image-url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                if (!file) setResults(null);
              }}
              dir="ltr"
              disabled={busy || Boolean(file)}
            />
          </div>
          <Button
            onClick={() => void run()}
            disabled={busy || !canSearch}
          >
            <Search className="size-4" />
            بحث
          </Button>
        </CardContent>
      </Card>

      {results !== null ? <ReverseSearchResults results={results} /> : null}
    </ToolPageShell>
  );
}
