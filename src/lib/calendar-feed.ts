import type {
  ArticleFeedMeta,
  CalendarFeedItem,
  CalendarItemType,
  EventFeedMeta,
  TaskFeedMeta,
} from "@/types";
import type { EventInput } from "@fullcalendar/core";

export const TYPE_FALLBACK_COLORS: Record<CalendarItemType, string> = {
  task: "#10b981",
  event: "#3b82f6",
  article: "#f98c34",
};

export const TYPE_LABELS: Record<CalendarItemType, string> = {
  task: "مهمة",
  event: "فعالية",
  article: "مقال مجدول",
};

export type CalendarTypeFilter = "all" | CalendarItemType;

export function feedItemToFcEvent(item: CalendarFeedItem): EventInput {
  const color = item.color ?? TYPE_FALLBACK_COLORS[item.type];

  return {
    id: item.id,
    title: item.title,
    start: item.start_at,
    end: item.end_at ?? undefined,
    allDay: false,
    backgroundColor: color,
    borderColor: color,
    textColor: "#ffffff",
    classNames: [`calendar-item--${item.type}`],
    extendedProps: { feedItem: item },
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
