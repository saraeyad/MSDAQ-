import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardStatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  accent?: string;
  href?: string;
  loading?: boolean;
}

export default function DashboardStatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "bg-secondary",
  href,
  loading,
}: DashboardStatCardProps) {
  const content = (
    <Card className="dashboard-stat-card group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className={cn("absolute inset-x-0 top-0 h-1", accent)} />
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {Icon ? <Icon className="size-4" /> : null}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader className="size-6 animate-spin text-muted-foreground" />
        ) : (
          <p className="font-headline text-4xl font-semibold tabular-nums">{value}</p>
        )}
        {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link to={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
