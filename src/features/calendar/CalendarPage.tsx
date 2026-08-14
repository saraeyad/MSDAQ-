import { Button } from "@/components/ui/button";
import { CalendarCreateDialog, type CalendarCreateMode } from "@/features/calendar/components/CalendarCreateDialog";
import { CalendarGrid, mapFeedToFcEvents } from "@/features/calendar/components/CalendarGrid";
import { CalendarItemDetail } from "@/features/calendar/components/CalendarItemDetail";
import { RecurrenceMoveDialog } from "@/features/calendar/components/RecurrenceMoveDialog";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { AdminPanel } from "@/features/admin/components/AdminPanel";
import { usePermission } from "@/hooks/usePermission";
import {
  filterFeedByType,
  isEventMeta,
  isTaskMeta,
  TYPE_FALLBACK_COLORS,
  TYPE_LABELS,
  type CalendarTypeFilter,
} from "@/lib/calendar-feed";
import {
  initialMonthRange,
  isoToDatetimeLocal,
  moveToOffsetIso,
  openCreateDatetime,
} from "@/lib/calendar-datetime";
import { getApiErrorMessage } from "@/lib/api-data";
import { cn } from "@/lib/utils";
import { PERMISSIONS } from "@/router/routes";
import { Calendar_APIs } from "@/services/api/calendar";
import { CalendarEvents_APIs } from "@/services/api/calendar-events";
import { CalendarTasks_APIs } from "@/services/api/calendar-tasks";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import type {
  CalendarEventRecord,
  CalendarFeedItem,
  CalendarMoveScope,
  CalendarTask,
} from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { EventDropArg } from "@fullcalendar/core";
import { CalendarDays, CalendarPlus, ClipboardList, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

type FormMode = CalendarCreateMode | null;
type PendingMove = { info: EventDropArg; item: CalendarFeedItem };

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
  const hasScheduleArticles = usePermission(PERMISSIONS.SCHEDULE_ARTICLES);
  const hasViewAllCalendar = usePermission(PERMISSIONS.VIEW_ALL_CALENDAR);

  const [dateRange, setDateRange] = useState(initialMonthRange);
  const [typeFilter, setTypeFilter] = useState<CalendarTypeFilter>("all");
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [createDueAt, setCreateDueAt] = useState("");
  const [createDateLocked, setCreateDateLocked] = useState(false);
  const [editingTask, setEditingTask] = useState<CalendarTask | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEventRecord | null>(
    null,
  );
  const [selectedItem, setSelectedItem] = useState<CalendarFeedItem | null>(
    null,
  );
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);

  const {
    data: feed = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["calendar-feed", dateRange.start, dateRange.end, typeFilter],
    queryFn: () =>
      Calendar_APIs.list({
        start: dateRange.start,
        end: dateRange.end,
        types: typeFilter === "all" ? undefined : [typeFilter],
      }),
  });

  const filteredFeed = useMemo(
    () => filterFeedByType(feed, typeFilter),
    [feed, typeFilter],
  );

  const fcEvents = useMemo(
    () =>
      mapFeedToFcEvents(filteredFeed, (type) => {
        if (type === "task") return hasManageTasks;
        if (type === "event") return hasManageEvents;
        return hasScheduleArticles;
      }),
    [filteredFeed, hasManageEvents, hasManageTasks, hasScheduleArticles],
  );
  const typeCounts = useMemo(() => countByType(feed), [feed]);

  const invalidateCalendar = () => {
    void queryClient.invalidateQueries({ queryKey: ["calendar-feed"] });
  };

  const resetForms = () => {
    setFormMode(null);
    setEditingTask(null);
    setEditingEvent(null);
    setCreateDueAt("");
    setCreateDateLocked(false);
  };

  const openCreateDialog = (
    mode: FormMode,
    date?: Date,
    lockDate = false,
  ) => {
    if (!mode) return;
    setEditingTask(null);
    setEditingEvent(null);
    setCreateDateLocked(lockDate && Boolean(date));
    setCreateDueAt(openCreateDatetime(date ?? new Date()));
    setFormMode(mode);
  };

  const openCreateForDate = (date: Date) => {
    if (!hasManageTasks && !hasManageEvents) return;
    if (hasManageTasks && hasManageEvents) {
      openCreateDialog("pick", date, true);
      return;
    }
    openCreateDialog(hasManageTasks ? "task" : "event", date, true);
  };

  const performMove = async (
    info: EventDropArg,
    item: CalendarFeedItem,
    scope: CalendarMoveScope,
  ) => {
    if (!info.event.start) {
      info.revert();
      return;
    }

    const movedTo = moveToOffsetIso(item.start_at, info.event.start);

    try {
      if (isTaskMeta(item)) {
        await CalendarTasks_APIs.move(item.source_id, {
          occurrence_date: item.meta.occurrence_date,
          moved_to: movedTo,
          scope,
        });
      } else if (isEventMeta(item)) {
        await CalendarEvents_APIs.move(item.source_id, {
          occurrence_date: item.meta.occurrence_date,
          moved_to: movedTo,
          scope,
        });
      } else {
        await ArticlesStaff_APIs.reschedule(item.source_id, movedTo);
      }

      toast.success(
        item.type === "article"
          ? "تمت إعادة جدولة المقال"
          : "تمت إعادة جدولة العنصر",
      );
      invalidateCalendar();
    } catch (error) {
      info.revert();
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleEventDrop = (info: EventDropArg, item: CalendarFeedItem) => {
    if ((isTaskMeta(item) || isEventMeta(item)) && item.meta.is_recurring) {
      setPendingMove({ info, item });
      return;
    }

    void performMove(info, item, "all");
  };

  const handleFormSuccess = () => {
    resetForms();
    invalidateCalendar();
  };

  const handleCreateDialogChange = (open: boolean) => {
    if (!open) resetForms();
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
        <Button onClick={() => openCreateDialog("task")} className="gap-2">
          <ClipboardList className="size-4" />
          مهمة جديدة
        </Button>
      )}
      {hasManageEvents && (
        <Button
          variant={hasManageTasks ? "outline" : "default"}
          onClick={() => openCreateDialog("event")}
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
      hasManageTasks={hasManageTasks}
      hasManageEvents={hasManageEvents}
      onDatesSet={(start, end) => setDateRange({ start, end })}
      onEventClick={setSelectedItem}
      onDateAddClick={openCreateForDate}
      onEventDrop={handleEventDrop}
      onAddTask={() => openCreateDialog("task")}
      onAddEvent={() => openCreateDialog("event")}
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
          </header>

          {calendarToolbar}

          {isError ? (
            <div className="calendar-error">{getApiErrorMessage(error)}</div>
          ) : null}

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
            setEditingEvent(null);
            setCreateDueAt(isoToDatetimeLocal(task.due_at));
            setFormMode("task");
          }}
          onEditEvent={(event) => {
            setEditingEvent(event);
            setEditingTask(null);
            setCreateDueAt(isoToDatetimeLocal(event.starts_at));
            setFormMode("event");
          }}
          onChanged={invalidateCalendar}
        />
      )}
      <RecurrenceMoveDialog
        open={pendingMove !== null}
        onOpenChange={(open) => {
          if (!open && pendingMove) {
            pendingMove.info.revert();
            setPendingMove(null);
          }
        }}
        onSelect={(scope) => {
          if (!pendingMove) return;
          const move = pendingMove;
          setPendingMove(null);
          void performMove(move.info, move.item, scope);
        }}
      />
      <CalendarCreateDialog
        open={formMode !== null}
        mode={formMode}
        createDueAt={createDueAt}
        createDateLocked={createDateLocked}
        editingTask={editingTask}
        editingEvent={editingEvent}
        hasManageTasks={hasManageTasks}
        hasManageEvents={hasManageEvents}
        onOpenChange={handleCreateDialogChange}
        onPickTask={() => setFormMode("task")}
        onPickEvent={() => setFormMode("event")}
        onSuccess={handleFormSuccess}
        onCancel={resetForms}
      />
    </div>
  );
}
