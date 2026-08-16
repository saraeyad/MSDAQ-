import {
  feedItemToFcEvent,
  isTaskMeta,
} from "@/lib/calendar-feed";
import { CalendarViewHeader, type CalendarViewType } from "@/features/calendar/components/CalendarViewHeader";
import { cn } from "@/lib/utils";
import type { CalendarFeedItem, CalendarItemType } from "@/types";
import FullCalendar from "@fullcalendar/react";
import type { CalendarApi, DatesSetArg, EventClickArg, EventContentArg, EventDropArg, EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import arLocale from "@fullcalendar/core/locales/ar";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { endOfMonth, format, getWeek, isValid, startOfMonth } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { calendarRangeToOffsetIso } from "@/lib/calendar-datetime";

function EventBlock({ eventInfo }: { eventInfo: EventContentArg }) {
  const item = eventInfo.event.extendedProps.feedItem as
    | CalendarFeedItem
    | undefined;
  const start = item?.start_at ? new Date(item.start_at) : null;
  const timeLabel =
    start && isValid(start) ? format(start, "HH:mm", { locale: ar }) : "—";
  const accent =
    eventInfo.event.borderColor ||
    eventInfo.event.backgroundColor ||
    eventInfo.event.extendedProps.accentColor ||
    "#f98c34";

  if (!item) {
    return (
      <div className="calendar-event-pill">
        <span className="calendar-event-pill__title">{eventInfo.event.title}</span>
        <span className="calendar-event-pill__time">{timeLabel}</span>
      </div>
    );
  }

  const done = isTaskMeta(item) && item.meta.status === "done";
  const overdue = isTaskMeta(item) && item.meta.status === "overdue";

  return (
    <div
      className={cn(
        "calendar-event-pill",
        `calendar-event-pill--${item.type}`,
        done && "calendar-event-pill--done",
        overdue && "calendar-event-pill--overdue",
      )}
      style={{ "--pill-accent": accent } as CSSProperties}
    >
      <span className="calendar-event-pill__title">{item.title}</span>
      <span className="calendar-event-pill__time">{timeLabel}</span>
    </div>
  );
}

interface CalendarGridProps {
  events: EventInput[];
  isLoading: boolean;
  canCreate: boolean;
  hasManageTasks: boolean;
  hasManageEvents: boolean;
  onDatesSet: (start: string, end: string) => void;
  onEventClick: (item: CalendarFeedItem) => void;
  onDateAddClick: (date: Date) => void;
  onEventDrop: (info: EventDropArg, item: CalendarFeedItem) => void;
  onAddTask: () => void;
  onAddEvent: () => void;
}

function buildHeaderMeta(view: DatesSetArg["view"], focusDate: Date) {
  const viewType = view.type as CalendarViewType;
  const monthStart = startOfMonth(focusDate);
  const monthEnd = endOfMonth(focusDate);
  const monthIconLabel = format(focusDate, "MMM", { locale: enUS }).toUpperCase();
  const dayNumber = format(focusDate, "d");
  const shared = { monthIconLabel, dayNumber };

  if (viewType === "dayGridMonth") {
    return {
      ...shared,
      title: format(monthStart, "MMMM yyyy", { locale: ar }),
      weekLabel: `الأسبوع ${getWeek(focusDate, { locale: ar })}`,
      rangeLabel: `${format(monthStart, "d MMM yyyy", { locale: ar })} – ${format(monthEnd, "d MMM yyyy", { locale: ar })}`,
    };
  }

  if (viewType === "timeGridWeek") {
    const rangeStart = view.currentStart;
    const rangeEnd = new Date(view.currentEnd.getTime() - 1);
    return {
      ...shared,
      title: format(rangeStart, "MMMM yyyy", { locale: ar }),
      weekLabel: `الأسبوع ${getWeek(rangeStart, { locale: ar })}`,
      rangeLabel: `${format(rangeStart, "d MMM yyyy", { locale: ar })} – ${format(rangeEnd, "d MMM yyyy", { locale: ar })}`,
    };
  }

  const rangeStart = view.currentStart;
  const rangeEnd = new Date(view.currentEnd.getTime() - 1);
  return {
    ...shared,
    title: format(rangeStart, "MMMM yyyy", { locale: ar }),
    weekLabel: `الأسبوع ${getWeek(rangeStart, { locale: ar })}`,
    rangeLabel: `${format(rangeStart, "d MMM yyyy", { locale: ar })} – ${format(rangeEnd, "d MMM yyyy", { locale: ar })}`,
  };
}

export function CalendarGrid({
  events,
  isLoading,
  canCreate,
  hasManageTasks,
  hasManageEvents,
  onDatesSet,
  onEventClick,
  onDateAddClick,
  onEventDrop,
  onAddTask,
  onAddEvent,
}: CalendarGridProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const onDateAddClickRef = useRef(onDateAddClick);

  useEffect(() => {
    onDateAddClickRef.current = onDateAddClick;
  }, [onDateAddClick]);
  const now = new Date();
  const [headerMeta, setHeaderMeta] = useState({
    title: format(now, "MMMM yyyy", { locale: ar }),
    monthIconLabel: format(now, "MMM", { locale: enUS }).toUpperCase(),
    dayNumber: format(now, "d"),
    weekLabel: `الأسبوع ${getWeek(now, { locale: ar })}`,
    rangeLabel: "",
    currentView: "dayGridMonth" as CalendarViewType,
  });

  const getApi = (): CalendarApi | undefined => calendarRef.current?.getApi();

  const handleDatesSet = (info: DatesSetArg) => {
    const focusDate = info.view.calendar.getDate();
    const dayNumber = format(focusDate, "d");
    setHeaderMeta({
      ...buildHeaderMeta(info.view, focusDate),
      dayNumber,
      currentView: info.view.type as CalendarViewType,
    });
    const range = calendarRangeToOffsetIso(info.start, info.end);
    onDatesSet(range.start, range.end);
  };

  const handleEventDrop = (info: EventDropArg) => {
    const item = info.event.extendedProps.feedItem as CalendarFeedItem | undefined;
    if (!item) {
      info.revert();
      return;
    }
    onEventDrop(info, item);
  };

  const mountDayAddButton = (cell: HTMLElement, date: Date) => {
    if (!canCreate) return;
    const frame = cell.querySelector(".fc-daygrid-day-frame");
    if (!frame || frame.querySelector(".calendar-day-add-btn")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day-add-btn";
    button.setAttribute("aria-label", "إضافة");
    button.textContent = "+";
    const cellDate = new Date(date.getTime());
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      event.preventDefault();
      onDateAddClickRef.current(cellDate);
    });
    frame.appendChild(button);
  };

  const handleDayCellDidMount = (info: { el: HTMLElement; date: Date }) => {
    mountDayAddButton(info.el, info.date);
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
      <CalendarViewHeader
        title={headerMeta.title}
        monthIconLabel={headerMeta.monthIconLabel}
        dayNumber={headerMeta.dayNumber}
        weekLabel={headerMeta.weekLabel}
        rangeLabel={headerMeta.rangeLabel}
        currentView={headerMeta.currentView}
        canCreate={canCreate}
        hasManageTasks={hasManageTasks}
        hasManageEvents={hasManageEvents}
        onPrev={() => getApi()?.prev()}
        onNext={() => getApi()?.next()}
        onToday={() => getApi()?.today()}
        onViewChange={(view) => getApi()?.changeView(view)}
        onAddTask={onAddTask}
        onAddEvent={onAddEvent}
      />
      <FullCalendar
      ref={calendarRef}
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
      locale={arLocale}
      direction="rtl"
      initialView="dayGridMonth"
      fixedWeekCount={false}
      showNonCurrentDates
      headerToolbar={false}
      moreLinkText={(count) => `+${count} أخرى`}
      height="auto"
      contentHeight={620}
      stickyHeaderDates
      nowIndicator
      editable
      eventDurationEditable={false}
      dayMaxEvents={3}
      events={events}
      datesSet={handleDatesSet}
      dayCellDidMount={handleDayCellDidMount}
      eventContent={(eventInfo) => <EventBlock eventInfo={eventInfo} />}
      eventClick={handleEventClick}
      eventDrop={handleEventDrop}
      />
    </div>
  );
}

export function mapFeedToFcEvents(
  items: CalendarFeedItem[],
  canDragType: (type: CalendarItemType) => boolean,
): EventInput[] {
  return items.map((item) => feedItemToFcEvent(item, canDragType(item.type)));
}
