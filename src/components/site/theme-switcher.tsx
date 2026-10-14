import { useTheme } from "@/context/theme";
import { usePublicCopy } from "@/context/locale";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const { theme: themeCopy } = usePublicCopy();
  const isDark = theme === "dark";
  const label = isDark ? themeCopy.switchToLight : themeCopy.switchToDark;
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "theme-switcher inline-flex size-9 shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0 text-foreground/75 shadow-none transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
      aria-label={label}
      title={label}
    >
      <Icon className="size-[1.15rem]" aria-hidden />
    </button>
  );
}
