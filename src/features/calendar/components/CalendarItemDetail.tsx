import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAuth } from "@/context/auth";
import {
  canCompleteTaskOccurrence,
  canManageTask,
  canReopenTaskOccurrence,
} from "@/lib/calendar-access";
import {
  isArticleMeta,
  isEventMeta,
  isTaskMeta,
  TYPE_LABELS,
} from "@/lib/calendar-feed";
import { getApiErrorMessage } from "@/lib/api-data";
import { mediaTypeLabel } from "@/lib/media-labels";
import { CalendarEvents_APIs } from "@/services/api/calendar-events";
import { CalendarTasks_APIs } from "@/services/api/calendar-tasks";
import { PERMISSIONS, staffArticlePath } from "@/router/routes";
import type {
  CalendarEventRecord,
  CalendarFeedItem,
  CalendarTask,
} from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format, isValid } from "date-fns";
import { ar } from "date-fns/locale";
import { formatScheduleDate } from "@/lib/calendar-datetime";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  Pencil,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { usePermission } from "@/hooks/usePermission";
import { cn } from "@/lib/utils";

const PRIORITY_LABELS = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
} as const;

const RECURRENCE_LABELS = {
  none: "بدون تكرار",
  daily: "يومي",
  weekly: "أسبوعي",
  monthly: "شهري",
} as const;

function PeopleChips({
  people,
  empty = "—",
}: {
  people: { id: number; name: string }[];
  empty?: string;
}) {
  if (people.length === 0) {
    return <span className="calendar-detail-people__empty">{empty}</span>;
  }

  return (
    <ul className="calendar-detail-people">
      {people.map((person) => (
        <li key={person.id} className="calendar-detail-people__chip">
          {person.name}
        </li>
      ))}
    </ul>
  );
}

interface CalendarItemDetailProps {
  item: CalendarFeedItem;
  onClose: () => void;
  onEditTask: (task: CalendarTask) => void;
  onEditEvent: (event: CalendarEventRecord) => void;
  onChanged: () => void;
}

export function CalendarItemDetail({
  item,
  onClose,
  onEditTask,
  onEditEvent,
  onChanged,
}: CalendarItemDetailProps) {
  const { user } = useAuth();
  const hasManageTasks = usePermission(PERMISSIONS.MANAGE_TASKS);
  const hasManageEvents = usePermission(PERMISSIONS.MANAGE_EVENTS);
  const hasCompleteOwnTasks = usePermission(PERMISSIONS.COMPLETE_OWN_TASKS);
  const hasScheduleArticles = usePermission(PERMISSIONS.SCHEDULE_ARTICLES);
  const [confirmDelete, setConfirmDelete] = useState<"task" | "event" | null>(
    null,
  );

  const start = new Date(item.start_at);
  const end = item.end_at ? new Date(item.end_at) : null;
  const occurrenceDate =
    isTaskMeta(item) || isEventMeta(item) ? item.meta.occurrence_date : null;

  const { data: taskDetail, isLoading: taskLoading } = useQuery({
    queryKey: ["calendar-task", item.source_id],
    queryFn: () => CalendarTasks_APIs.get(item.source_id),
    enabled: item.type === "task",
  });

  const { data: eventDetail, isLoading: eventLoading } = useQuery({
    queryKey: ["calendar-event", item.source_id],
    queryFn: () => CalendarEvents_APIs.get(item.source_id),
    enabled: item.type === "event",
  });

  const completeMutation = useMutation({
    mutationFn: () => {
      if (!occurrenceDate) throw new Error("missing date");
      return CalendarTasks_APIs.complete(item.source_id, {
        occurrence_date: occurrenceDate,
      });
    },
    onSuccess: () => {
      toast.success("تم إكمال المهمة");
      onChanged();
      onClose();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const reopenMutation = useMutation({
    mutationFn: () => {
      if (!occurrenceDate) throw new Error("missing date");
      return CalendarTasks_APIs.reopen(item.source_id, {
        occurrence_date: occurrenceDate,
      });
    },
    onSuccess: () => {
      toast.success("تم إعادة فتح المهمة");
      onChanged();
      onClose();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: () => CalendarTasks_APIs.delete(item.source_id),
    onSuccess: () => {
      toast.success("تم حذف المهمة");
      onChanged();
      onClose();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const deleteEventMutation = useMutation({
    mutationFn: () => CalendarEvents_APIs.delete(item.source_id),
    onSuccess: () => {
      toast.success("تم حذف الفعالية");
      onChanged();
      onClose();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const showComplete = canCompleteTaskOccurrence(
    item,
    user,
    hasCompleteOwnTasks,
    taskDetail,
    hasManageTasks,
  );
  const showReopen = canReopenTaskOccurrence(
    item,
    user,
    hasCompleteOwnTasks,
    taskDetail,
    hasManageTasks,
  );
  const showEditTask =
    item.type === "task" && hasManageTasks && Boolean(user);
  const showDeleteTask =
    showEditTask && Boolean(taskDetail);
  const showEditEvent =
    item.type === "event" && hasManageEvents && Boolean(user);
  const showDeleteEvent =
    showEditEvent && Boolean(eventDetail);

  const isPending =
    completeMutation.isPending ||
    reopenMutation.isPending ||
    deleteTaskMutation.isPending ||
    deleteEventMutation.isPending;

  return (
    <div
      className="calendar-detail-backdrop"
      onClick={onClose}
    >
      <div
        className={cn(
          "calendar-detail-modal",
          `calendar-detail-modal--${item.type}`,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="calendar-detail-modal__header">
          <div className="calendar-detail-modal__heading">
            <span className="calendar-detail-modal__type">{TYPE_LABELS[item.type]}</span>
            <h3 className="calendar-detail-modal__title">{item.title}</h3>
            <p className="calendar-detail-modal__datetime">
              {isValid(start)
                ? `${formatScheduleDate(start)} — ${format(start, "HH:mm", { locale: ar })}`
                : "—"}
              {end && isValid(end)
                ? ` – ${format(end, "HH:mm", { locale: ar })}`
                : ""}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="calendar-detail-modal__close" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        {(taskLoading || eventLoading) && (
          <div className="calendar-detail-modal__loading">
            <Loader2 className="size-4 animate-spin" aria-hidden />
          </div>
        )}

        <div className="calendar-detail-modal__body">
          {isTaskMeta(item) && (
            <div className="calendar-detail-fields">
              {taskDetail?.description ? (
                <p className="calendar-detail-fields__desc">{taskDetail.description}</p>
              ) : null}
              <dl className="calendar-detail-dl">
                <div className="calendar-detail-dl__row">
                  <dt>الأولوية</dt>
                  <dd>{PRIORITY_LABELS[item.meta.priority]}</dd>
                </div>
                <div className="calendar-detail-dl__row">
                  <dt>الحالة</dt>
                  <dd>
                    {item.meta.status === "done"
                      ? "مكتملة"
                      : item.meta.status === "overdue"
                        ? "متأخرة"
                        : "قيد التنفيذ"}
                  </dd>
                </div>
                <div className="calendar-detail-dl__row">
                  <dt>التكرار</dt>
                  <dd>
                    {taskDetail?.recurrence && taskDetail.recurrence !== "none"
                      ? RECURRENCE_LABELS[taskDetail.recurrence]
                      : item.meta.is_recurring
                        ? "مهمة متكررة"
                        : "بدون تكرار"}
                    {taskDetail?.recurrence_end_at
                      ? ` · حتى ${formatScheduleDate(new Date(taskDetail.recurrence_end_at))}`
                      : ""}
                  </dd>
                </div>
                <div className="calendar-detail-dl__row calendar-detail-dl__row--stack">
                  <dt>المُسنَد إليهم</dt>
                  <dd>
                    <PeopleChips people={item.meta.assignees} />
                  </dd>
                </div>
                {taskDetail?.creator && (
                  <div className="calendar-detail-dl__row">
                    <dt>المنشئ</dt>
                    <dd>{taskDetail.creator.name}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {isEventMeta(item) && (
            <div className="calendar-detail-fields">
              {eventDetail?.description ? (
                <p className="calendar-detail-fields__desc">{eventDetail.description}</p>
              ) : null}
              <dl className="calendar-detail-dl">
                <div className="calendar-detail-dl__row calendar-detail-dl__row--stack">
                  <dt>المشاركون</dt>
                  <dd>
                    <PeopleChips people={item.meta.participants} />
                  </dd>
                </div>
                <div className="calendar-detail-dl__row">
                  <dt>التكرار</dt>
                  <dd>
                    {eventDetail?.recurrence && eventDetail.recurrence !== "none"
                      ? RECURRENCE_LABELS[eventDetail.recurrence]
                      : item.meta.is_recurring
                        ? "فعالية متكررة"
                        : "بدون تكرار"}
                    {eventDetail?.recurrence_end_at
                      ? ` · حتى ${formatScheduleDate(new Date(eventDetail.recurrence_end_at))}`
                      : ""}
                  </dd>
                </div>
                {eventDetail?.creator && (
                  <div className="calendar-detail-dl__row">
                    <dt>المنشئ</dt>
                    <dd>{eventDetail.creator.name}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {isArticleMeta(item) && (
            <div className="calendar-detail-fields">
              <dl className="calendar-detail-dl">
                <div className="calendar-detail-dl__row">
                  <dt>الكاتب</dt>
                  <dd>{item.meta.author}</dd>
                </div>
                <div className="calendar-detail-dl__row">
                  <dt>التصنيف</dt>
                  <dd>{item.meta.category.name_ar}</dd>
                </div>
                <div className="calendar-detail-dl__row">
                  <dt>نوع الوسيط</dt>
                  <dd>{mediaTypeLabel(item.meta.media_type)}</dd>
                </div>
              </dl>
              <p className="calendar-detail-fields__hint">
                {hasScheduleArticles
                  ? "يمكنك سحب المقال في التقويم لإعادة جدولة وقت نشره."
                  : "مقال مجدول للنشر — للعرض فقط من التقويم"}
              </p>
              <Button asChild variant="outline" size="sm" className="gap-1 w-fit">
                <Link to={staffArticlePath(item.source_id)}>
                  <ExternalLink className="size-3" />
                  فتح المقال
                </Link>
              </Button>
            </div>
          )}
        </div>

        <div className="calendar-detail-modal__actions">
          {showComplete && (
            <Button
              size="sm"
              className="gap-1"
              disabled={isPending}
              onClick={() => completeMutation.mutate()}
            >
              {completeMutation.isPending ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <CheckCircle2 className="size-3" />
              )}
              إكمال
            </Button>
          )}
          {showReopen && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              disabled={isPending}
              onClick={() => reopenMutation.mutate()}
            >
              {reopenMutation.isPending ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <RotateCcw className="size-3" />
              )}
              إعادة فتح
            </Button>
          )}
          {showEditTask && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              disabled={!taskDetail || taskLoading || isPending}
              onClick={() => {
                if (!taskDetail) return;
                onEditTask(taskDetail);
                onClose();
              }}
            >
              {taskLoading ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Pencil className="size-3" />
              )}
              تعديل
            </Button>
          )}
          {showDeleteTask && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-destructive"
              disabled={isPending}
              onClick={() => setConfirmDelete("task")}
            >
              {deleteTaskMutation.isPending ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Trash2 className="size-3" />
              )}
              حذف
            </Button>
          )}
          {showEditEvent && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              disabled={!eventDetail || eventLoading || isPending}
              onClick={() => {
                if (!eventDetail) return;
                onEditEvent(eventDetail);
                onClose();
              }}
            >
              {eventLoading ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Pencil className="size-3" />
              )}
              تعديل
            </Button>
          )}
          {showDeleteEvent && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-destructive"
              disabled={isPending}
              onClick={() => setConfirmDelete("event")}
            >
              {deleteEventMutation.isPending ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Trash2 className="size-3" />
              )}
              حذف
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete === "task"}
        description="هل تريد حذف هذه المهمة؟ لا يمكن التراجع عن هذا الإجراء."
        isPending={deleteTaskMutation.isPending}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteTaskMutation.mutate()}
      />
      <ConfirmDialog
        open={confirmDelete === "event"}
        description="هل تريد حذف هذه الفعالية؟ لا يمكن التراجع عن هذا الإجراء."
        isPending={deleteEventMutation.isPending}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteEventMutation.mutate()}
      />
    </div>
  );
}
