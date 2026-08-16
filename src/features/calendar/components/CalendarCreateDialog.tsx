import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EventForm } from "@/features/calendar/components/EventForm";
import { TaskForm } from "@/features/calendar/components/TaskForm";
import type { CalendarEventRecord, CalendarTask } from "@/types";
import { CalendarPlus, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalendarCreateMode = "pick" | "task" | "event";

interface CalendarCreateDialogProps {
  open: boolean;
  mode: CalendarCreateMode | null;
  createDueAt: string;
  createDateLocked: boolean;
  editingTask: CalendarTask | null;
  editingEvent: CalendarEventRecord | null;
  hasManageTasks: boolean;
  hasManageEvents: boolean;
  onOpenChange: (open: boolean) => void;
  onPickTask: () => void;
  onPickEvent: () => void;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CalendarCreateDialog({
  open,
  mode,
  createDueAt,
  createDateLocked,
  editingTask,
  editingEvent,
  hasManageTasks,
  hasManageEvents,
  onOpenChange,
  onPickTask,
  onPickEvent,
  onSuccess,
  onCancel,
}: CalendarCreateDialogProps) {
  const isEditing = Boolean(editingTask || editingEvent);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "calendar-create-dialog gap-0 p-0 sm:max-w-2xl",
          mode === "task" && "calendar-create-dialog--task",
          mode === "event" && "calendar-create-dialog--event",
        )}
      >
        <div className="calendar-create-dialog__header">
          {mode === "pick" && (
            <>
              <DialogHeader className="gap-1 text-start">
                <DialogTitle>إنشاء في هذا التاريخ</DialogTitle>
                <DialogDescription>
                  اختر نوع العنصر الذي تريد إضافته إلى التقويم.
                </DialogDescription>
              </DialogHeader>
              <div className="calendar-create-dialog__pick">
                {hasManageTasks && (
                  <Button
                    type="button"
                    variant="outline"
                    className="calendar-create-dialog__pick-btn"
                    onClick={onPickTask}
                  >
                    <ClipboardList className="size-4" />
                    مهمة
                  </Button>
                )}
                {hasManageEvents && (
                  <Button
                    type="button"
                    variant="outline"
                    className="calendar-create-dialog__pick-btn"
                    onClick={onPickEvent}
                  >
                    <CalendarPlus className="size-4" />
                    فعالية
                  </Button>
                )}
              </div>
            </>
          )}

          {mode === "task" && hasManageTasks && (
            <>
              <DialogHeader className="gap-1 text-start">
                <DialogTitle>
                  {editingTask ? "تعديل المهمة" : "مهمة جديدة"}
                </DialogTitle>
                {!isEditing && (
                  <DialogDescription>
                    أضف مهمة جديدة وحدّد موعد الاستحقاق والمسؤولين.
                  </DialogDescription>
                )}
              </DialogHeader>
              <div className="calendar-create-dialog__body">
                <TaskForm
                  embedded
                  editingTask={editingTask}
                  initialDueAt={createDueAt}
                  dateLocked={createDateLocked && !editingTask}
                  onSuccess={onSuccess}
                  onCancel={onCancel}
                />
              </div>
            </>
          )}

          {mode === "event" && hasManageEvents && (
            <>
              <DialogHeader className="gap-1 text-start">
                <DialogTitle>
                  {editingEvent ? "تعديل الفعالية" : "فعالية جديدة"}
                </DialogTitle>
                {!isEditing && (
                  <DialogDescription>
                    أضف فعالية جديدة وحدّد وقت البداية والنهاية.
                  </DialogDescription>
                )}
              </DialogHeader>
              <div className="calendar-create-dialog__body">
                <EventForm
                  embedded
                  editingEvent={editingEvent}
                  initialStartsAt={createDueAt}
                  dateLocked={createDateLocked && !editingEvent}
                  onSuccess={onSuccess}
                  onCancel={onCancel}
                />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
