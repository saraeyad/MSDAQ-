import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth";
import { getRoleDashboardRoute } from "@/lib/auth-redirect";
import { getUserDisplayName, getUserInitials } from "@/lib/user-display";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Loader, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface UserAccountMenuProps {
  onLogout: () => void | Promise<void>;
  loggingOut?: boolean;
  className?: string;
}

export default function UserAccountMenu({
  onLogout,
  loggingOut = false,
  className,
}: UserAccountMenuProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const displayName = getUserDisplayName(user?.name, user?.email);
  const initials = getUserInitials(user?.name, user?.email);
  const dashboardRoute =
    user?.role === "admin" || user?.role === "journalist"
      ? getRoleDashboardRoute(user.role)
      : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "user-account-trigger inline-flex items-center rounded-full border border-border bg-card p-0.5 transition-colors hover:border-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40",
            className,
          )}
          aria-label={displayName || t("auth.accountMenu")}
        >
          <Avatar className="size-9">
            <AvatarFallback className="bg-secondary/10 font-headline text-sm font-semibold text-secondary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="font-headline text-sm font-semibold leading-none text-foreground">
              {displayName}
            </p>
            {user?.email ? (
              <p className="text-xs text-muted-foreground">{user.email}</p>
            ) : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {dashboardRoute ? (
          <DropdownMenuItem asChild>
            <Link to={dashboardRoute}>
              <LayoutDashboard className="size-4" />
              {t("auth.goToDashboard")}
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          variant="destructive"
          disabled={loggingOut}
          onSelect={(event) => {
            event.preventDefault();
            void onLogout();
          }}
        >
          {loggingOut ? (
            <Loader className="size-4 animate-spin" />
          ) : (
            <LogOut className="size-4" />
          )}
          {t("auth.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
