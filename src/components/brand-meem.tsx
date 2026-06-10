import { cn } from "@/lib/utils";

interface BrandMeemProps {
  className?: string;
}

/** Decorative م from the MISDAQ wordmark — used as a subtle brand motif */
export default function BrandMeem({ className }: BrandMeemProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "font-headline pointer-events-none select-none leading-none text-foreground/5",
        className
      )}
    >
      م
    </span>
  );
}
