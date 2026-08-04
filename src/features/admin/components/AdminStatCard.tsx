import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Accent = "primary" | "warning" | "success" | "muted";

const ACCENT_CLASSES: Record<Accent, string> = {
  primary: "admin-stat-icon-primary",
  warning: "admin-stat-icon-warning",
  success: "admin-stat-icon-success",
  muted: "admin-stat-icon-muted",
};

interface AdminStatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  accent?: Accent;
  sublabel?: string;
}

export function AdminStatCard({
  icon: Icon,
  value,
  label,
  accent = "primary",
  sublabel,
}: AdminStatCardProps) {
  return (
    <div className="content-card flex items-start gap-4 p-5">
      <div className={cn("admin-stat-icon", ACCENT_CLASSES[accent])}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {sublabel ? (
          <p className="mt-0.5 text-xs text-muted-foreground/80">{sublabel}</p>
        ) : null}
      </div>
    </div>
  );
}
