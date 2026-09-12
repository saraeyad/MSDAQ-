import "@/styles/staff/staff-app.css";
import { BrandLogo } from "@/components/brand/brand-logo";
import { RouteErrorBoundary } from "@/components/route-error-boundary";
import { useAuth } from "@/context/auth";
import { StaffNavLinks } from "@/features/staff/nav/StaffNavLinks";
import { StaffShellTopbar } from "@/features/staff/nav/StaffShellTopbar";
import { getVisibleStaffNav } from "@/features/staff/nav/staff-nav";
import { useIsSuperAdmin } from "@/hooks/auth";
import { useMemo } from "react";
import { Outlet } from "react-router-dom";

export default function NewsroomLayout() {
  const { permissions } = useAuth();
  const isSuperAdmin = useIsSuperAdmin();

  const visibleLinks = useMemo(
    () => getVisibleStaffNav(permissions, isSuperAdmin),
    [permissions, isSuperAdmin],
  );

  return (
    <div className="staff-shell" dir="rtl">
      <aside className="staff-shell__aside">
        <div className="staff-shell__brand">
          <BrandLogo size="lg" linkToHome={false} />
        </div>
        <div className="staff-shell__nav">
          <StaffNavLinks items={visibleLinks} />
        </div>
      </aside>

      <div className="staff-shell__main">
        <StaffShellTopbar items={visibleLinks} />
        <main className="admin-shell-main py-4 md:py-6">
          <div className="container-page">
            <RouteErrorBoundary>
              <Outlet />
            </RouteErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
