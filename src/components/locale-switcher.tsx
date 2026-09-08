import { useLocale } from "@/context/locale";
import { LOCALE_SWITCH_READY } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

export function LocaleSwitcher({ className }: { className?: string }) {
  const { locale, copy, toggleLocale } = useLocale();
  const ready = LOCALE_SWITCH_READY;

  return (
    <button
      type="button"
      onClick={ready ? toggleLocale : undefined}
      disabled={!ready}
      className={cn(
        "locale-switcher inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/90 px-2.5 py-1.5 text-xs font-semibold text-foreground/80 shadow-sm transition-colors",
        ready
          ? "hover:border-primary/35 hover:text-primary"
          : "cursor-not-allowed opacity-55",
        className,
      )}
      aria-label={
        ready
          ? `${copy.locale.switchTo} — ${locale === "ar" ? "English" : "العربية"}`
          : copy.locale.comingSoon
      }
      title={ready ? copy.locale.switchTo : copy.locale.comingSoon}
    >
      <Globe className="size-3.5 shrink-0 opacity-70" aria-hidden />
      <span className="locale-switcher__label">{copy.locale.current}</span>
    </button>
  );
}
