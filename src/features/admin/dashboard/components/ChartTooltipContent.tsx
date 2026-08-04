interface ChartTooltipContentProps {
  label?: string;
  value?: number | string;
  color?: string;
}

export function ChartTooltipContent({
  label,
  value,
  color,
}: ChartTooltipContentProps) {
  if (label == null || value == null) return null;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
      <div className="flex items-center gap-2">
        {color ? (
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
        ) : null}
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{value}</span>
      </div>
    </div>
  );
}
