import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function FormSection({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("publish-form-section", className)}>
      <header className="publish-form-section__header">
        <span className="publish-form-section__icon" aria-hidden>
          <Icon className="size-4" strokeWidth={1.75} />
        </span>
        <div>
          <h3 className="publish-form-section__title">{title}</h3>
          {description ? (
            <p className="publish-form-section__desc">{description}</p>
          ) : null}
        </div>
      </header>
      <div className="publish-form-section__body">{children}</div>
    </section>
  );
}
