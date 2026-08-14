import type {
  ArticleFeedMeta,
  CalendarFeedItem,
  CalendarItemType,
  EventFeedMeta,
  TaskFeedMeta,
} from "@/types";
import type { EventInput } from "@fullcalendar/core";

export const CALENDAR_TYPE_COLORS = {
  task: "#16a34a",
  event: "#c2410c",
  article: "#f98c34",
} as const;

export const TYPE_FALLBACK_COLORS: Record<CalendarItemType, string> = {
  task: CALENDAR_TYPE_COLORS.task,
  event: CALENDAR_TYPE_COLORS.event,
  article: CALENDAR_TYPE_COLORS.article,
};

export const TYPE_LABELS: Record<CalendarItemType, string> = {
  task: "مهمة",
  event: "فعالية",
  article: "مقال مجدول",
};

export type CalendarTypeFilter = "all" | CalendarItemType;

export function feedItemToFcEvent(
  item: CalendarFeedItem,
  isDraggable = false,
): EventInput {
  const color = item.color ?? TYPE_FALLBACK_COLORS[item.type];

  return {
    id: item.id,
    title: item.title,
    start: item.start_at,
    end: item.end_at ?? undefined,
    allDay: false,
    backgroundColor: "transparent",
    borderColor: color,
    textColor: color,
    classNames: [`calendar-item--${item.type}`],
    extendedProps: { feedItem: item, accentColor: color },
    startEditable: isDraggable,
    durationEditable: false,
  };
}

export function filterFeedByType(
  items: CalendarFeedItem[],
  filter: CalendarTypeFilter,
): CalendarFeedItem[] {
  if (filter === "all") return items;
  return items.filter((item) => item.type === filter);
}

export function isTaskMeta(
  item: CalendarFeedItem,
): item is CalendarFeedItem & { meta: TaskFeedMeta } {
  return item.type === "task";
}

export function isEventMeta(
  item: CalendarFeedItem,
): item is CalendarFeedItem & { meta: EventFeedMeta } {
  return item.type === "event";
}

export function isArticleMeta(
  item: CalendarFeedItem,
): item is CalendarFeedItem & { meta: ArticleFeedMeta } {
  return item.type === "article";
}

/** Extract YYYY-MM-DD from occurrence id like task-4-2026-07-30 */
export function occurrenceDateFromFeedId(feedId: string): string | null {
  const match = feedId.match(/(\d{4}-\d{2}-\d{2})$/);
  return match?.[1] ?? null;
}
