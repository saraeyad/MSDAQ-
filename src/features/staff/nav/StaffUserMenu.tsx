import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/utils";
import { ChevronDown, LogOut } from "lucide-react";

function UserAvatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0) || "?";
  return (
    <span className="staff-user-menu__avatar" aria-hidden>
      {initial}
    </span>
  );
}

export function StaffUserMenu({ className }: { className?: string }) {
  const { user, logout } = useAuth();
  const name = user?.name?.trim() || "حساب";
  const role = user?.roles?.[0] ?? "موظف";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn("staff-user-menu", className)}>
        <UserAvatar name={name} />
        <span className="staff-user-menu__meta">
          <span className="staff-user-menu__name">{name}</span>
          <span className="staff-user-menu__role">{role}</span>
        </span>
        <ChevronDown className="staff-user-menu__chevron" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="staff-user-menu__dropdown">
        <div className="staff-user-menu__card">
          <UserAvatar name={name} />
          <div className="min-w-0">
            <p className="staff-user-menu__name">{name}</p>
            <p className="staff-user-menu__role">{role}</p>
          </div>
        </div>
        <DropdownMenuItem
          variant="destructive"
          className="staff-user-menu__logout"
          onSelect={() => logout()}
        >
          <LogOut className="size-4" />
          تسجيل الخروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
