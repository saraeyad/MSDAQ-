interface BarChartRowProps {
  label: string;
  value: number;
  max: number;
}

export function BarChartRow({ label, value, max }: BarChartRowProps) {
  const pct = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span>{label}</span>
        <span className="font-medium text-foreground">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-l from-primary/80 to-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
