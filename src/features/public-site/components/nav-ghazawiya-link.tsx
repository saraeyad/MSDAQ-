import { OliveBranch } from "@/components/ghazawiya/olive-branch";
import { cn } from "@/lib/utils";

/** شارة تنسيقية بجانب الشعار — ليست رابطاً */
export function NavGhazawiyaLink({ className }: { className?: string }) {
  return (
    <span className={cn("nav-ghazawiya", className)} aria-hidden="true">
      <OliveBranch className="nav-ghazawiya__branch" />
      <span className="nav-ghazawiya__text">غزاوية</span>
      <OliveBranch flip className="nav-ghazawiya__branch" />
    </span>
  );
}
