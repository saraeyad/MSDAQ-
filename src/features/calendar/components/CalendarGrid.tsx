import {
  feedItemToFcEvent,
  isArticleMeta,
  isEventMeta,
  isTaskMeta,
  TYPE_LABELS,
} from "@/lib/calendar-feed";
import { cn } from "@/lib/utils";
import type { CalendarFeedItem } from "@/types";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import arLocale from "@fullcalendar/core/locales/ar";
import type {
  DatesSetArg,
  EventClickArg,
  EventContentArg,
  EventInput,
} from "@fullcalendar/core";
import { format, isValid } from "date-fns";
import { ar } from "date-fns/locale";
import { subDays } from "date-fns";

function EventBlock({ eventInfo }: { eventInfo: EventContentArg }) {
  const item = eventInfo.event.extendedProps.feedItem as
    | CalendarFeedItem
    | undefined;
  const start = item?.start_at ? new Date(item.start_at) : null;
  const timeLabel =
    start && isValid(start) ? format(start, "HH:mm", { locale: ar }) : "—";

  if (!item) {
    return (
      <div className="fc-task-event px-1 py-0.5 leading-tight">
        <div className="truncate text-[11px] font-semibold">
          {eventInfo.event.title}
        </div>
      </div>
    );
  }

  const done = isTaskMeta(item) && item.meta.status === "done";

  let subtitle = TYPE_LABELS[item.type];
  if (isTaskMeta(item)) {
    subtitle = `${timeLabel} · ${item.meta.assignees.map((a) => a.name).join("، ") || "—"}`;
  } else if (isEventMeta(item)) {
    subtitle = `${timeLabel} · ${item.meta.participants.length} مشارك`;
  } else if (isArticleMeta(item)) {
    subtitle = `مجدول · ${item.meta.author}`;
  }

  return (
    <div
      className={cn(
        "calendar-event-pill",
        `calendar-event-pill--${item.type}`,
        done && "calendar-event-pill--done",
      )}
    >
      <span className="calendar-event-pill__tag">{TYPE_LABELS[item.type]}</span>
      <div className="calendar-event-pill__title">{item.title}</div>
      <div className="calendar-event-pill__meta">{subtitle}</div>
    </div>
  );
}

interface CalendarGridProps {
  events: EventInput[];
  isLoading: boolean;
  canCreate: boolean;
  onDatesSet: (start: string, end: string) => void;
  onEventClick: (item: CalendarFeedItem) => void;
  onDateClick: (date: Date) => void;
}

export function CalendarGrid({
  events,
  isLoading,
  canCreate,
  onDatesSet,
  onEventClick,
  onDateClick,
}: CalendarGridProps) {
  const handleDatesSet = (info: DatesSetArg) => {
    onDatesSet(
      format(info.start, "yyyy-MM-dd"),
      format(subDays(info.end, 1), "yyyy-MM-dd"),
    );
  };

  const handleEventClick = (info: EventClickArg) => {
    info.jsEvent.preventDefault();
    const item = info.event.extendedProps.feedItem as CalendarFeedItem | undefined;
    if (item) onEventClick(item);
  };

  if (isLoading) {
    return (
      <div className="calendar-grid-loading">
        <div className="calendar-grid-loading__bar" />
        <div className="calendar-grid-loading__grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="calendar-grid-loading__cell" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-grid-shell">
      <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
      locale={arLocale}
      direction="rtl"
      initialView="dayGridMonth"
      headerToolbar={{
        start: "prev,next today",
        center: "title",
        end: "dayGridMonth,timeGridWeek,listWeek",
      }}
      buttonText={{
        today: "اليوم",
        month: "شهر",
        week: "أسبوع",
        list: "قائمة",
      }}
      height="auto"
      contentHeight={620}
      stickyHeaderDates
      nowIndicator
      editable={false}
      selectable={canCreate}
      selectMirror
      dayMaxEvents={3}
      events={events}
      datesSet={handleDatesSet}
      eventContent={(eventInfo) => <EventBlock eventInfo={eventInfo} />}
      eventClick={handleEventClick}
      dateClick={(info) => onDateClick(info.date)}
      select={(info) => onDateClick(info.start)}
      />
    </div>
  );
}

export function mapFeedToFcEvents(items: CalendarFeedItem[]): EventInput[] {
  return items.map(feedItemToFcEvent);
}
