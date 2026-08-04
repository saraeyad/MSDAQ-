import { Button } from "@/components/ui/button";
import { CalendarGrid, mapFeedToFcEvents } from "@/features/calendar/components/CalendarGrid";
import { CalendarItemDetail } from "@/features/calendar/components/CalendarItemDetail";
import { EventForm } from "@/features/calendar/components/EventForm";
import { TaskForm } from "@/features/calendar/components/TaskForm";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { AdminPanel } from "@/features/admin/components/AdminPanel";
import { usePermission } from "@/hooks/usePermission";
import {
  filterFeedByType,
  TYPE_FALLBACK_COLORS,
  TYPE_LABELS,
  type CalendarTypeFilter,
} from "@/lib/calendar-feed";
import {
  initialMonthRange,
  openCreateDatetime,
} from "@/lib/calendar-datetime";
import { getApiErrorMessage } from "@/lib/api-data";
import { cn } from "@/lib/utils";
import { PERMISSIONS } from "@/router/routes";
import { Calendar_APIs } from "@/services/api/calendar";
import type {
  CalendarEventRecord,
  CalendarFeedItem,
  CalendarTask,
} from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, CalendarPlus, ClipboardList, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

type FormMode = "task" | "event" | null;

const TYPE_FILTERS: { id: CalendarTypeFilter; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "task", label: "مهام" },
  { id: "event", label: "فعاليات" },
  { id: "article", label: "مقالات" },
];

function countByType(feed: CalendarFeedItem[]) {
  return {
    task: feed.filter((item) => item.type === "task").length,
    event: feed.filter((item) => item.type === "event").length,
    article: feed.filter((item) => item.type === "article").length,
  };
}

export default function CalendarPage({
  variant = "newsroom",
}: {
  variant?: "newsroom" | "admin";
}) {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const hasManageTasks = usePermission(PERMISSIONS.MANAGE_TASKS);
  const hasManageEvents = usePermission(PERMISSIONS.MANAGE_EVENTS);
  const hasViewAllCalendar = usePermission(PERMISSIONS.VIEW_ALL_CALENDAR);

  const [dateRange, setDateRange] = useState(initialMonthRange);
  const [typeFilter, setTypeFilter] = useState<CalendarTypeFilter>("all");
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [createDueAt, setCreateDueAt] = useState("");
  const [editingTask, setEditingTask] = useState<CalendarTask | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEventRecord | null>(
    null,
  );
  const [selectedItem, setSelectedItem] = useState<CalendarFeedItem | null>(
    null,
  );
  const [createPickerDate, setCreatePickerDate] = useState<Date | null>(null);

  const {
    data: feed = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["calendar-feed", dateRange.start, dateRange.end],
    queryFn: () =>
      Calendar_APIs.list({
        start: dateRange.start,
        end: dateRange.end,
      }),
  });

  const filteredFeed = useMemo(
    () => filterFeedByType(feed, typeFilter),
    [feed, typeFilter],
  );

  const fcEvents = useMemo(() => mapFeedToFcEvents(filteredFeed), [filteredFeed]);
  const typeCounts = useMemo(() => countByType(feed), [feed]);

  const invalidateCalendar = () => {
    void queryClient.invalidateQueries({ queryKey: ["calendar-feed"] });
  };

  const resetForms = () => {
    setFormMode(null);
    setEditingTask(null);
    setEditingEvent(null);
    setCreateDueAt("");
    setCreatePickerDate(null);
  };

  const handleFormSuccess = () => {
    resetForms();
    invalidateCalendar();
  };

  const openCreateForDate = (date: Date) => {
    if (!hasManageTasks && !hasManageEvents) return;
    setCreatePickerDate(date);
    setCreateDueAt(openCreateDatetime(date));
    setEditingTask(null);
    setEditingEvent(null);
    if (hasManageTasks && !hasManageEvents) {
      setFormMode("task");
    } else if (hasManageEvents && !hasManageTasks) {
      setFormMode("event");
    } else {
      setFormMode(null);
    }
  };

  useEffect(() => {
    const itemId = searchParams.get("item");
    if (!itemId || feed.length === 0) return;
    const match = feed.find((entry) => entry.id === itemId);
    if (match) {
      setSelectedItem(match);
      searchParams.delete("item");
      setSearchParams(searchParams, { replace: true });
    }
  }, [feed, searchParams, setSearchParams]);

  const canCreate = hasManageTasks || hasManageEvents;
  const isAdmin = variant === "admin";

  const headerDescription =
    "مهام · فعاليات · مقالات مجدولة — يعرض التقويم عناصرك؛ المنسّقة الإعلامية ترى الفريق كاملاً";

  const headerActions = (
    <div className="calendar-hero__actions">
      {hasManageTasks && (
        <Button
          onClick={() => {
            resetForms();
            setFormMode("task");
          }}
          className="gap-2"
        >
          <ClipboardList className="size-4" />
          مهمة جديدة
        </Button>
      )}
      {hasManageEvents && (
        <Button
          variant={hasManageTasks ? "outline" : "default"}
          onClick={() => {
            resetForms();
            setFormMode("event");
          }}
          className="gap-2"
        >
          <CalendarPlus className="size-4" />
          فعالية جديدة
        </Button>
      )}
    </div>
  );

  const calendarToolbar = (
    <div className="calendar-toolbar">
      <div className="calendar-toolbar__filters">
        {TYPE_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setTypeFilter(filter.id)}
            className={cn(
              "calendar-filter-chip",
              typeFilter === filter.id && "calendar-filter-chip--active",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="calendar-toolbar__legend">
        {(["task", "event", "article"] as const).map((type) => (
          <span key={type} className="calendar-legend-item">
            <span
              className="calendar-legend-item__dot"
              style={{ backgroundColor: TYPE_FALLBACK_COLORS[type] }}
            />
            {TYPE_LABELS[type]}
            <span className="calendar-legend-item__count">{typeCounts[type]}</span>
          </span>
        ))}
      </div>
    </div>
  );

  const calendarGrid = (
    <CalendarGrid
      events={fcEvents}
      isLoading={isLoading}
      canCreate={canCreate}
      onDatesSet={(start, end) => setDateRange({ start, end })}
      onEventClick={setSelectedItem}
      onDateClick={openCreateForDate}
    />
  );

  return (
    <div className="calendar-page" dir="rtl">
      {isAdmin ? (
        <>
          <AdminPageHeader
            title="التقويم التحريري"
            description={headerDescription}
            actions={canCreate ? headerActions : undefined}
          />
          {calendarToolbar}
          {isError ? (
            <AdminPanel accent="warning">
              <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
            </AdminPanel>
          ) : null}
          {createPickerDate && !formMode && canCreate && (
            <CreateDatePrompt
              hasManageTasks={hasManageTasks}
              hasManageEvents={hasManageEvents}
              onTask={() => setFormMode("task")}
              onEvent={() => setFormMode("event")}
              onCancel={() => setCreatePickerDate(null)}
            />
          )}
          {formMode === "task" && hasManageTasks && (
            <TaskForm
              editingTask={editingTask}
              initialDueAt={createDueAt}
              onSuccess={handleFormSuccess}
              onCancel={resetForms}
            />
          )}
          {formMode === "event" && hasManageEvents && (
            <EventForm
              editingEvent={editingEvent}
              initialStartsAt={createDueAt}
              onSuccess={handleFormSuccess}
              onCancel={resetForms}
            />
          )}
          <AdminPanel title="التقويم">
            <div className="team-calendar calendar-panel calendar-panel--embedded">
              {calendarGrid}
            </div>
          </AdminPanel>
        </>
      ) : (
        <>
          <header className="calendar-hero">
            <div className="calendar-hero__content">
              <div className="calendar-hero__badge">
                <CalendarDays className="size-3.5" />
                التقويم التحريري
              </div>
              <h2 className="calendar-hero__title">جدول الفريق</h2>
              <p className="calendar-hero__desc">{headerDescription}</p>
              {hasViewAllCalendar && (
                <span className="calendar-hero__team-badge">
                  <Users className="size-3" />
                  عرض الفريق الكامل
                </span>
              )}
            </div>
            {canCreate ? headerActions : null}
          </header>

          {calendarToolbar}

          {isError ? (
            <div className="calendar-error">{getApiErrorMessage(error)}</div>
          ) : null}

          {createPickerDate && !formMode && canCreate && (
            <CreateDatePrompt
              hasManageTasks={hasManageTasks}
              hasManageEvents={hasManageEvents}
              onTask={() => setFormMode("task")}
              onEvent={() => setFormMode("event")}
              onCancel={() => setCreatePickerDate(null)}
            />
          )}

          {formMode === "task" && hasManageTasks && (
            <TaskForm
              editingTask={editingTask}
              initialDueAt={createDueAt}
              onSuccess={handleFormSuccess}
              onCancel={resetForms}
            />
          )}

          {formMode === "event" && hasManageEvents && (
            <EventForm
              editingEvent={editingEvent}
              initialStartsAt={createDueAt}
              onSuccess={handleFormSuccess}
              onCancel={resetForms}
            />
          )}

          <div className="team-calendar calendar-panel">
            {calendarGrid}
          </div>
        </>
      )}

      {selectedItem && (
        <CalendarItemDetail
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onEditTask={(task) => {
            setEditingTask(task);
            setFormMode("task");
          }}
          onEditEvent={(event) => {
            setEditingEvent(event);
            setFormMode("event");
          }}
          onChanged={invalidateCalendar}
        />
      )}
    </div>
  );
}

function CreateDatePrompt({
  hasManageTasks,
  hasManageEvents,
  onTask,
  onEvent,
  onCancel,
}: {
  hasManageTasks: boolean;
  hasManageEvents: boolean;
  onTask: () => void;
  onEvent: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="calendar-create-prompt">
      <span className="calendar-create-prompt__label">إنشاء في هذا التاريخ:</span>
      <div className="calendar-create-prompt__actions">
        {hasManageTasks && (
          <Button size="sm" onClick={onTask}>
            مهمة
          </Button>
        )}
        {hasManageEvents && (
          <Button size="sm" variant="outline" onClick={onEvent}>
            فعالية
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </div>
  );
}
