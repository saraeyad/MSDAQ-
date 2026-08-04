import type { AppNotification } from "@/types";
import { ROUTES } from "@/router/routes";

function dataString(
  data: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function typeSlug(type: string): string {
  const segment = type.split("\\").pop() ?? type;
  return segment.replace(/Notification$/i, "").replace(/([A-Z])/g, " $1").trim();
}

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  TaskAssignedNotification: "مهمة جديدة",
  EventParticipantAddedNotification: "دعوة فعالية",
  CalendarTaskAssignedNotification: "مهمة جديدة",
  CalendarEventParticipantNotification: "دعوة فعالية",
};

export function notificationIsUnread(notification: AppNotification): boolean {
  return notification.read_at == null;
}

export function notificationTitle(notification: AppNotification): string {
  const normalizedType = notification.type.split("\\").pop() ?? notification.type;

  return (
    dataString(notification.data, ["title", "task_title", "event_title", "subject"]) ??
    NOTIFICATION_TYPE_LABELS[normalizedType] ??
    typeSlug(notification.type) ??
    "إشعار"
  );
}

export function notificationBody(
  notification: AppNotification,
): string | null {
  return dataString(notification.data, [
    "message",
    "body",
    "description",
    "content",
  ]);
}

function calendarDeepLink(
  notification: AppNotification,
  calendarRoute: string,
): string | null {
  const occurrenceId = dataString(notification.data, [
    "calendar_item_id",
    "occurrence_id",
    "feed_id",
  ]);
  if (occurrenceId) {
    return `${calendarRoute}?item=${encodeURIComponent(occurrenceId)}`;
  }

  const taskId = notification.data.task_id;
  if (typeof taskId === "number" || typeof taskId === "string") {
    return calendarRoute;
  }

  const eventId = notification.data.event_id;
  if (typeof eventId === "number" || typeof eventId === "string") {
    return calendarRoute;
  }

  return null;
}

export function notificationLink(
  notification: AppNotification,
  calendarRoute: string,
): string | null {
  const typeLower = notification.type.toLowerCase();
  if (
    typeLower.includes("calendar") ||
    typeLower.includes("task") ||
    typeLower.includes("event")
  ) {
    return calendarDeepLink(notification, calendarRoute) ?? calendarRoute;
  }
  return null;
}

export function formatNotificationTime(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "الآن";
  if (diffMins < 60) return `منذ ${diffMins} د`;
  if (diffHours < 24) return `منذ ${diffHours} س`;
  if (diffDays < 7) return `منذ ${diffDays} ي`;
  return date.toLocaleDateString("ar");
}

export const DEFAULT_CALENDAR_ROUTE = ROUTES.NEWSROOM_CALENDAR;
