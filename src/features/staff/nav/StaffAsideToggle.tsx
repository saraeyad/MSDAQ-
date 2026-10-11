import { ChevronLeft } from "lucide-react";

export function StaffAsideToggle({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="staff-shell__aside-toggle"
      aria-pressed={collapsed}
      aria-label={collapsed ? "فتح الشريط الجانبي" : "إغلاق الشريط الجانبي"}
      onClick={onToggle}
    >
      <ChevronLeft className="size-4" aria-hidden />
    </button>
  );
}
