import { cn } from "@/lib/utils";

interface VoiceDraftNoticeProps {
  generateLabel: string;
  saveLabel: string;
  className?: string;
}

/** Two-step draft workflow: generate → review → save by name. */
export function VoiceDraftNotice({
  generateLabel,
  saveLabel,
  className,
}: VoiceDraftNoticeProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-muted/20 p-4",
        className,
      )}
    >
      <ol className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4">
        <li className="flex flex-1 items-start gap-3">
          <span
            aria-hidden
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
          >
            1
          </span>
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">{generateLabel}</p>
            <p className="text-xs text-muted-foreground">ينشئ مسودة للمراجعة</p>
          </div>
        </li>

        <li
          aria-hidden
          className="hidden w-px shrink-0 self-stretch bg-border sm:block"
        />

        <li className="flex flex-1 items-start gap-3">
          <span
            aria-hidden
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
          >
            2
          </span>
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">{saveLabel}</p>
            <p className="text-xs text-muted-foreground">بالاسم → المكتبة المشتركة</p>
          </div>
        </li>
      </ol>

      <p className="mt-3 border-t border-border/60 pt-3 text-xs text-muted-foreground">
        المسودات غير المحفوظة تُحذف تلقائياً خلال 24 ساعة.
      </p>
    </div>
  );
}
