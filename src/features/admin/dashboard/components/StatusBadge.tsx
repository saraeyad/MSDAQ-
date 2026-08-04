import { articleStatusLabel } from "@/lib/media-labels";
import { cn } from "@/lib/utils";
import type { ArticleStatus } from "@/types";
import {
  CalendarClock,
  CheckCircle2,
  FileEdit,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";

const STATUS_CONFIG: Record<
  ArticleStatus,
  { icon: LucideIcon; className: string }
> = {
  published: {
    icon: CheckCircle2,
    className: "text-success bg-success/10",
  },
  draft: {
    icon: FileEdit,
    className: "text-muted-foreground bg-muted/60",
  },
  scheduled: {
    icon: CalendarClock,
    className: "text-primary bg-primary/10",
  },
  reverted: {
    icon: RotateCcw,
    className: "text-warning bg-warning/10",
  },
};

interface StatusBadgeProps {
  status: ArticleStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {articleStatusLabel(status)}
    </span>
  );
}
