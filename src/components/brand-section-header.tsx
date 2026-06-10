import { cn } from "@/lib/utils";

interface BrandSectionHeaderProps {
  label: string;
  title: string;
  description?: string;
  className?: string;
  centered?: boolean;
}

export default function BrandSectionHeader({
  label,
  title,
  description,
  className,
  centered = false,
}: BrandSectionHeaderProps) {
  return (
    <div className={cn(centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl", className)}>
      <p className="text-label-caps text-secondary">{label}</p>
      <h2 className="text-headline-md mt-2">{title}</h2>
      {description ? (
        <>
          <div className={cn("home-editorial-rule mt-4", centered && "mx-auto")} />
          <p className="mt-4 text-body-md text-muted-foreground">{description}</p>
        </>
      ) : null}
    </div>
  );
}
