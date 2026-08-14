import { cn } from "@/lib/utils";
import {
  groupStaffNavItems,
  STAFF_NAV_GROUPS,
  type StaffNavItem,
} from "@/features/staff/nav/staff-nav";
import { NavLink } from "react-router-dom";

export function StaffNavLinks({
  items,
  onNavigate,
}: {
  items: StaffNavItem[];
  onNavigate?: () => void;
}) {
  const grouped = groupStaffNavItems(items);

  return (
    <div className="space-y-5">
      {grouped.map(({ key, items: groupItems }) => (
        <div key={key} className="staff-shell__nav-group">
          <p className="staff-shell__nav-label">{STAFF_NAV_GROUPS[key]}</p>
          <nav className="space-y-0.5">
            {groupItems.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "admin-sidebar-link-active"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    key === "newsroom" &&
                      link.to.startsWith("/newsroom") &&
                      !isActive &&
                      "font-semibold text-foreground/80",
                  )
                }
              >
                <link.icon className="size-4 shrink-0" />
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      ))}
    </div>
  );
}
