import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DomainCheckResultView } from "@/features/tools/components/DomainCheckResultView";
import { getApiErrorMessage } from "@/lib/api-data";
import {
  normalizeDomainInput,
  validateBareDomain,
} from "@/lib/domain-input";
import { DomainCheck_APIs } from "@/services/api/domain-check";
import type { DomainCheckResult } from "@/types";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ToolPageShell } from "./ToolPageShell";

export function DomainCheckerToolPage() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DomainCheckResult | null>(null);

  const run = async () => {
    const normalized = normalizeDomainInput(domain);
    const validationError = validateBareDomain(normalized);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const data = await DomainCheck_APIs.check(normalized);
      setResult(data);
      toast.success("تم جلب معلومات النطاق");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPageShell title="فحص النطاق">
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) void run();
              }}
              dir="ltr"
              className="sm:flex-1"
            />
            <Button onClick={() => void run()} disabled={loading} className="gap-2">
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              فحص
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            أدخل النطاق بدون http:// أو www — يعرض WHOIS والتحليل الأمني
            وسجلات DNS.
          </p>
        </CardContent>
      </Card>

      {result ? (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <DomainCheckResultView result={result} />
          </CardContent>
        </Card>
      ) : null}
    </ToolPageShell>
  );
}
