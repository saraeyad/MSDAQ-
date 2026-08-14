import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type AccentBorder = "primary" | "warning" | "success" | "none";

const BORDER_CLASSES: Record<AccentBorder, string> = {
  primary: "admin-panel-accent-primary",
  warning: "admin-panel-accent-warning",
  success: "admin-panel-accent-success",
  none: "",
};

interface AdminPanelProps {
  title?: string;
  description?: string;
  badge?: string | number;
  icon?: LucideIcon;
  accent?: AccentBorder;
  className?: string;
  headerActions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  flush?: boolean;
}

export function AdminPanel({
  title,
  description,
  badge,
  icon: Icon,
  accent = "none",
  className,
  headerActions,
  children,
  footer,
  flush = false,
}: AdminPanelProps) {
  return (
    <div
      className={cn(
        "content-card overflow-hidden",
        BORDER_CLASSES[accent],
        className,
      )}
    >
      {(title || headerActions) && (
        <div className="flex items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {Icon ? (
                <Icon className="size-4 shrink-0 text-primary" />
              ) : null}
              {title ? (
                <h3 className="font-headline text-base font-semibold">{title}</h3>
              ) : null}
              {badge !== undefined ? (
                <Badge variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              ) : null}
            </div>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {headerActions ? (
            <div className="flex shrink-0 items-center gap-2">{headerActions}</div>
          ) : null}
        </div>
      )}
      <div className={cn(flush ? "p-0" : "p-5")}>{children}</div>
      {footer ? (
        <div className="border-t border-border/60 bg-muted/20 px-5 py-3">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
