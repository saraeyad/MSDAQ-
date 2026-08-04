const BARE_DOMAIN_REGEX =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

export function normalizeDomainInput(input: string): string {
  let value = input.trim().toLowerCase();
  if (!value) return "";

  value = value.replace(/^https?:\/\//i, "");
  value = value.replace(/^www\./i, "");
  value = value.split("/")[0]?.split("?")[0]?.split("#")[0] ?? "";
  value = value.replace(/\/+$/, "");

  return value;
}

export function validateBareDomain(domain: string): string | null {
  if (!domain) {
    return "أدخل نطاقاً";
  }
  if (/^https?:\/\//i.test(domain) || /^www\./i.test(domain)) {
    return "أدخل النطاق بدون http:// أو www (مثل example.com)";
  }
  if (!BARE_DOMAIN_REGEX.test(domain)) {
    return "صيغة النطاق غير صالحة — استخدم example.com";
  }
  return null;
}

export function formatDomainDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("ar", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
