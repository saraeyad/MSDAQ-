import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import type { ReactNode } from "react";

interface AdminFilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  searchPlaceholder?: string;
  children?: ReactNode;
  className?: string;
}

export function AdminFilterBar({
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder = "بحث...",
  children,
  className,
}: AdminFilterBarProps) {
  const hasSearch = onSearchChange !== undefined;

  return (
    <div
      className={cn(
        "content-card flex flex-wrap items-center gap-3 p-4",
        className,
      )}
    >
      {hasSearch ? (
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearchSubmit?.();
            }}
            placeholder={searchPlaceholder}
            className="ps-9"
          />
        </div>
      ) : null}
      {onSearchSubmit ? (
        <Button variant="outline" size="sm" onClick={onSearchSubmit}>
          بحث
        </Button>
      ) : null}
      {children}
    </div>
  );
}
