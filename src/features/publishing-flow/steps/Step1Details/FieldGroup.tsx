import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function FieldGroup({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("publish-field", className)}>
      <Label className="publish-field__label">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
    </div>
  );
}
