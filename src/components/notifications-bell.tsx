import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications } from "@/hooks/useNotifications";
import { getApiErrorMessage } from "@/lib/api-data";
import {
  formatNotificationTime,
  notificationBody,
  notificationIsUnread,
  notificationLink,
  notificationTitle,
} from "@/lib/notification-labels";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/types";
import { Bell, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface NotificationsBellProps {
  calendarRoute: string;
}

function NotificationRow({
  notification,
  calendarRoute,
  onMarkRead,
  onDelete,
  isDeleting,
}: {
  notification: AppNotification;
  calendarRoute: string;
  onMarkRead: (id: string) => Promise<unknown>;
  onDelete: (notification: AppNotification) => Promise<unknown>;
  isDeleting: boolean;
}) {
  const navigate = useNavigate();
  const unread = notificationIsUnread(notification);
  const title = notificationTitle(notification);
  const body = notificationBody(notification);
  const link = notificationLink(notification, calendarRoute);

  const handleClick = async () => {
    try {
      if (unread) {
        await onMarkRead(notification.id);
      }
      if (link) {
        navigate(link);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("حذف هذا الإشعار؟")) return;
    try {
      await onDelete(notification);
      toast.success("تم حذف الإشعار");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-start transition-colors hover:bg-muted/70",
        unread && "bg-accent/30",
      )}
    >
      <span
        className={cn(
          "mt-1.5 size-2 shrink-0 rounded-full",
          unread ? "bg-primary" : "bg-transparent",
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug">{title}</p>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {formatNotificationTime(notification.created_at)}
          </span>
        </div>
        {body && (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {body}
          </p>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
        disabled={isDeleting}
        onClick={handleDelete}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </button>
  );
}

export function NotificationsBell({ calendarRoute }: NotificationsBellProps) {
  const [open, setOpen] = useState(false);
  const {
    unreadCount,
    notifications,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    markRead,
    markAllRead,
    deleteNotification,
    clearAll,
    isMarkingAllRead,
    isClearingAll,
    isDeleting,
    refetch,
  } = useNotifications();

  const badgeLabel =
    unreadCount > 9 ? "9+" : unreadCount > 0 ? String(unreadCount) : null;

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      toast.success("تم تعليم جميع الإشعارات كمقروءة");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("حذف جميع الإشعارات؟")) return;
    try {
      await clearAll();
      toast.success("تم مسح جميع الإشعارات");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) void refetch();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="الإشعارات"
        >
          <Bell className="size-5" />
          {badgeLabel && (
            <span className="absolute -top-0.5 -start-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {badgeLabel}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">الإشعارات</h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={unreadCount === 0 || isMarkingAllRead}
              onClick={() => void handleMarkAllRead()}
            >
              {isMarkingAllRead && <Loader2 className="size-3 animate-spin" />}
              تعليم الكل كمقروء
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-destructive hover:text-destructive"
              disabled={notifications.length === 0 || isClearingAll}
              onClick={() => void handleClearAll()}
            >
              {isClearingAll && <Loader2 className="size-3 animate-spin" />}
              مسح الكل
            </Button>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              لا توجد إشعارات
            </p>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  calendarRoute={calendarRoute}
                  onMarkRead={markRead}
                  onDelete={deleteNotification}
                  isDeleting={isDeleting}
                />
              ))}
            </div>
          )}

          {hasNextPage && (
            <div className="border-t border-border p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                disabled={isFetchingNextPage}
                onClick={() => void fetchNextPage()}
              >
                {isFetchingNextPage && (
                  <Loader2 className="size-3 animate-spin" />
                )}
                تحميل المزيد
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
