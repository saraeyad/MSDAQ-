import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import {
  canCompleteTaskOccurrence,
  canManageEvent,
  canManageTask,
  canReopenTaskOccurrence,
} from "@/lib/calendar-access";
import {
  isArticleMeta,
  isEventMeta,
  isTaskMeta,
  occurrenceDateFromFeedId,
  TYPE_LABELS,
} from "@/lib/calendar-feed";
import { getApiErrorMessage } from "@/lib/api-data";
import { mediaTypeLabel } from "@/lib/media-labels";
import { CalendarEvents_APIs } from "@/services/api/calendar-events";
import { CalendarTasks_APIs } from "@/services/api/calendar-tasks";
import { PERMISSIONS, ROUTES } from "@/router/routes";
import type {
  CalendarEventRecord,
  CalendarFeedItem,
  CalendarTask,
} from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format, isValid } from "date-fns";
import { ar } from "date-fns/locale";
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
import { usePermission } from "@/hooks/usePermission";
import { cn } from "@/lib/utils";

const PRIORITY_LABELS = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
} as const;

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

  const start = new Date(item.start_at);
  const end = item.end_at ? new Date(item.end_at) : null;
  const occurrenceDate = occurrenceDateFromFeedId(item.id);

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
  );
  const showReopen = canReopenTaskOccurrence(
    item,
    user,
    hasCompleteOwnTasks,
    taskDetail,
    hasManageTasks,
  );
  const showEditTask =
    taskDetail && canManageTask(taskDetail, user, hasManageTasks);
  const showDeleteTask =
    taskDetail && canManageTask(taskDetail, user, hasManageTasks);
  const showEditEvent =
    eventDetail && canManageEvent(eventDetail, user, hasManageEvents);
  const showDeleteEvent =
    eventDetail && canManageEvent(eventDetail, user, hasManageEvents);

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
                ? format(start, "EEEE d MMMM — HH:mm", { locale: ar })
                : "—"}
              {end && isValid(end)
                ? ` → ${format(end, "HH:mm", { locale: ar })}`
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
                  <dd>{item.meta.status === "done" ? "مكتملة" : "قيد التنفيذ"}</dd>
                </div>
                <div className="calendar-detail-dl__row">
                  <dt>المُسنَد إليهم</dt>
                  <dd>{item.meta.assignees.map((a) => a.name).join("، ") || "—"}</dd>
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
                <div className="calendar-detail-dl__row">
                  <dt>المشاركون</dt>
                  <dd>{item.meta.participants.map((p) => p.name).join("، ") || "—"}</dd>
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
                مقال مجدول للنشر — للعرض فقط من التقويم
              </p>
              <Button asChild variant="outline" size="sm" className="gap-1 w-fit">
                <Link to={`${ROUTES.NEWSROOM_ARTICLES}/${item.source_id}`}>
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
          {showEditTask && taskDetail && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => {
                onEditTask(taskDetail);
                onClose();
              }}
            >
              <Pencil className="size-3" />
              تعديل
            </Button>
          )}
          {showDeleteTask && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-destructive"
              disabled={isPending}
              onClick={() => {
                if (!window.confirm("حذف هذه المهمة؟")) return;
                deleteTaskMutation.mutate();
              }}
            >
              {deleteTaskMutation.isPending ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Trash2 className="size-3" />
              )}
              حذف
            </Button>
          )}
          {showEditEvent && eventDetail && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => {
                onEditEvent(eventDetail);
                onClose();
              }}
            >
              <Pencil className="size-3" />
              تعديل
            </Button>
          )}
          {showDeleteEvent && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-destructive"
              disabled={isPending}
              onClick={() => {
                if (!window.confirm("حذف هذه الفعالية؟")) return;
                deleteEventMutation.mutate();
              }}
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
    </div>
  );
}
