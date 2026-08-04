import { Skeleton } from "@/components/ui/skeleton";

type Variant = "dashboard" | "table" | "form";

interface AdminLoadingStateProps {
  variant?: Variant;
}

export function AdminLoadingState({ variant = "table" }: AdminLoadingStateProps) {
  if (variant === "dashboard") {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (variant === "form") {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-14 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
