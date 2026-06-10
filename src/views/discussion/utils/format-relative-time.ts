import i18n from "@/i18n";

function toDateValue(date: string | Date): number {
  if (date instanceof Date) return date.getTime();
  const normalized = date.includes("T") ? date : date.replace(" ", "T");
  return new Date(normalized).getTime();
}

export function formatRelativeTime(date: string | Date): string {
  const value = toDateValue(date);
  const diffMs = Date.now() - value;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  const locale = i18n.language === "ar" ? "ar" : "en";

  if (diffMinutes < 1) {
    return i18n.language === "ar" ? "الآن" : "Just now";
  }
  if (diffMinutes < 60) {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
      -diffMinutes,
      "minute"
    );
  }
  if (diffHours < 24) {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
      -diffHours,
      "hour"
    );
  }
  if (diffDays < 7) {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
      -diffDays,
      "day"
    );
  }

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}
