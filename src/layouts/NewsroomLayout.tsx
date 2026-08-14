import { BrandLogo } from "@/components/brand-logo";
import { RouteErrorBoundary } from "@/components/route-error-boundary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/auth";
import { StaffNavLinks } from "@/features/staff/nav/StaffNavLinks";
import {
  STAFF_ORG_LABEL,
  getVisibleStaffNav,
} from "@/features/staff/nav/staff-nav";
import { useIsSuperAdmin } from "@/hooks/useIsSuperAdmin";
import { LogOut, Menu } from "lucide-react";
import { useMemo, useState } from "react";
import { Outlet } from "react-router-dom";

function UserAvatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0) || "?";
  return (
    <div className="admin-stat-icon admin-stat-icon-primary size-9 text-sm font-bold">
      {initial}
    </div>
  );
}

export default function NewsroomLayout() {
  const { user, logout, permissions } = useAuth();
  const isSuperAdmin = useIsSuperAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleLinks = useMemo(
    () => getVisibleStaffNav(permissions, isSuperAdmin),
    [permissions, isSuperAdmin],
  );
  const userRole = user?.roles?.[0] ?? "موظف";

  return (
    <div className="staff-shell">
      <aside className="staff-shell__aside">
        <div className="staff-shell__brand">
          <BrandLogo size="lg" linkToHome={false} />
          <p className="staff-shell__brand-label">{STAFF_ORG_LABEL}</p>
        </div>
        <div className="staff-shell__nav">
          <StaffNavLinks items={visibleLinks} />
        </div>
        <div className="staff-shell__footer space-y-3">
          <div className="staff-shell__user">
            <UserAvatar name={user?.name ?? "?"} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user?.name}</p>
              <Badge variant="secondary" className="mt-1 text-[10px]">
                {userRole}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={() => logout()}
          >
            <LogOut className="size-4" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="staff-shell__topbar">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="فتح القائمة">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <SheetHeader className="border-b border-border p-4 text-start">
                <BrandLogo size="md" linkToHome={false} className="mb-2" />
                <SheetTitle className="font-headline text-sm leading-snug">
                  {STAFF_ORG_LABEL}
                </SheetTitle>
              </SheetHeader>
              <div className="flex h-[calc(100%-5.5rem)] flex-col">
                <div className="flex-1 overflow-y-auto p-3">
                  <StaffNavLinks
                    items={visibleLinks}
                    onNavigate={() => setMobileOpen(false)}
                  />
                </div>
                <div className="border-t border-border p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                  >
                    <LogOut className="size-4" />
                    تسجيل الخروج
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </header>
        <main className="admin-shell-main flex-1 py-4 md:py-6">
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
