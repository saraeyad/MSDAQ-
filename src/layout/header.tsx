import JournalistNotificationsBell from "@/components/journalist-notifications-bell";
import LanguageSwitcher from "@/components/language-switcher";
import UserAccountMenu from "@/components/user-account-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { getRoleDashboardRoute } from "@/lib/auth-redirect";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/router/routes";
import { Auth_APIs } from "@/services/api/auth";
import { LayoutDashboard, Menu } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

interface HeaderProps {
  onToggleSidebar: VoidFunction;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const dashboardRoute =
    user?.role === "admin" || user?.role === "journalist"
      ? getRoleDashboardRoute(user.role)
      : null;

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await Auth_APIs.logout();
      logout();
      navigate(ROUTES.LOGIN, { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header
      className={cn(
        "fixed start-0 end-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 md:start-72"
      )}
    >
      <div className="flex items-center gap-2">
        <Button onClick={onToggleSidebar} variant="ghost" size="icon" className="md:hidden">
          <Menu className="size-5" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        {dashboardRoute ? (
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" asChild>
            <Link to={dashboardRoute}>
              <LayoutDashboard className="size-4" />
              {t("auth.goToDashboard")}
            </Link>
          </Button>
        ) : null}
        {user?.role === "journalist" ? <JournalistNotificationsBell /> : null}
        <LanguageSwitcher />
        <UserAccountMenu onLogout={handleLogout} loggingOut={loggingOut} />
      </div>
    </header>
  );
}
