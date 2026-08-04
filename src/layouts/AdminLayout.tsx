import { BrandLogo } from "@/components/brand-logo";
import { NotificationsBell } from "@/components/notifications-bell";
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
import { ROUTES } from "@/router/routes";
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

function SidebarFooter({
  userName,
  userRole,
  onLogout,
}: {
  userName?: string;
  userRole?: string;
  onLogout: () => void;
}) {
  return (
    <div className="space-y-3 border-t border-border p-4">
      <div className="content-card flex items-center gap-3 p-3">
        <UserAvatar name={userName ?? "?"} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{userName}</p>
          <Badge variant="secondary" className="mt-1 text-[10px]">
            {userRole ?? "مدير"}
          </Badge>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 text-muted-foreground"
        onClick={onLogout}
      >
        <LogOut className="size-4" />
        تسجيل الخروج
      </Button>
    </div>
  );
}

export default function AdminLayout() {
  const { user, logout, permissions } = useAuth();
  const isSuperAdmin = useIsSuperAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleLinks = useMemo(
    () => getVisibleStaffNav(permissions, isSuperAdmin),
    [permissions, isSuperAdmin],
  );
  const userRole = user?.roles?.[0] ?? "مدير";

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 flex-col border-e border-border bg-sidebar md:flex">
        <div className="border-b border-border p-4">
          <BrandLogo size="lg" linkToHome={false} />
          <p className="mt-3 text-xs leading-snug text-muted-foreground">
            {STAFF_ORG_LABEL}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <StaffNavLinks items={visibleLinks} />
        </div>
        <SidebarFooter
          userName={user?.name}
          userRole={userRole}
          onLogout={() => logout()}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-border bg-card/90 px-4 backdrop-blur-md md:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                aria-label="فتح القائمة"
              >
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
                <SidebarFooter
                  userName={user?.name}
                  userRole={userRole}
                  onLogout={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
          <div className="ms-auto">
            <NotificationsBell calendarRoute={ROUTES.NEWSROOM_CALENDAR} />
          </div>
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
