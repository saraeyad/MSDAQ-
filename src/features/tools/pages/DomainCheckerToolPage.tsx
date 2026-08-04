import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-data";
import {
  formatDomainDate,
  normalizeDomainInput,
  validateBareDomain,
} from "@/lib/domain-input";
import { DomainCheck_APIs } from "@/services/api/domain-check";
import type { DomainCheckResult } from "@/types";
import { Loader2 } from "lucide-react";
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
          <Input
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            dir="ltr"
          />
          <p className="text-xs text-muted-foreground">
            أدخل النطاق بدون http:// أو www
          </p>
          <Button onClick={run} disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            فحص
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="space-y-3 p-6 text-sm">
            <p>
              <span className="font-medium">النطاق:</span> {result.domain}
            </p>
            <p>
              <span className="font-medium">الحالة:</span>{" "}
              {result.is_available ? "متاح للتسجيل" : "مسجّل"}
            </p>
            {!result.is_available && (
              <>
                <p>
                  <span className="font-medium">تاريخ التسجيل:</span>{" "}
                  {formatDomainDate(result.registered_at)}
                </p>
                <p>
                  <span className="font-medium">تاريخ الانتهاء:</span>{" "}
                  {formatDomainDate(result.expires_at)}
                </p>
                <p>
                  <span className="font-medium">آخر تحديث:</span>{" "}
                  {formatDomainDate(result.updated_at)}
                </p>
                {result.registrar && (
                  <p>
                    <span className="font-medium">جهة التسجيل:</span>{" "}
                    {result.registrar}
                  </p>
                )}
                {result.name_servers && result.name_servers.length > 0 && (
                  <div>
                    <p className="font-medium">خوادم الأسماء:</p>
                    <ul className="mt-1 list-disc space-y-1 ps-5 text-muted-foreground">
                      {result.name_servers.map((ns) => (
                        <li key={ns} dir="ltr">
                          {ns}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </ToolPageShell>
  );
}
