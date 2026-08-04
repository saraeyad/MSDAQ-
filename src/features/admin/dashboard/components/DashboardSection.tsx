import type { ReactNode } from "react";

interface DashboardSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function DashboardSection({
  title,
  description,
  children,
}: DashboardSectionProps) {
  return (
    <section className="space-y-4">
      <h3 className="font-headline text-lg font-semibold">{title}</h3>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      {children}
    </section>
  );
}
