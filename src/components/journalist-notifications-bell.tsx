import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/router/routes";
import useJournalistNotifications from "@/views/journalist/hooks/useJournalistNotifications";
import { Bell, Loader } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function JournalistNotificationsBell() {
  const { t } = useTranslation();
  const { data, isLoading } = useJournalistNotifications();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unread_count ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={t("journalist.notifications.title")}>
          <Bell className="size-5" />
          {unreadCount > 0 ? (
            <span className="absolute end-1 top-1 flex size-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>{t("journalist.notifications.title")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-muted-foreground">
            {t("journalist.notifications.empty")}
          </p>
        ) : (
          notifications.slice(0, 8).map((notification) => {
            const articleId = notification.data.article_id;
            const href = articleId
              ? `${ROUTES.JOURNALIST_EDITOR}?id=${articleId}`
              : ROUTES.JOURNALIST_DASHBOARD;

            return (
              <DropdownMenuItem key={notification.id} asChild>
                <Link
                  to={href}
                  className={cn(
                    "flex flex-col items-start gap-0.5",
                    !notification.read_at && "bg-secondary/5",
                  )}
                >
                  <span className="text-sm font-medium">
                    {notification.data.message ?? notification.data.article_title}
                  </span>
                  {notification.data.article_title ? (
                    <span className="line-clamp-1 text-xs text-muted-foreground">
                      {notification.data.article_title}
                    </span>
                  ) : null}
                  <span className="text-[10px] text-muted-foreground/70">
                    {notification.created_at}
                  </span>
                </Link>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
