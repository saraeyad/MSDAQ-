import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColorPicker } from "@/features/calendar/components/ColorPicker";
import { UserMultiSelect } from "@/features/calendar/components/UserMultiSelect";
import {
  datetimeLocalToIso,
  isoToDatetimeLocal,
} from "@/lib/calendar-datetime";
import { getApiErrorMessage } from "@/lib/api-data";
import { CalendarTasks_APIs } from "@/services/api/calendar-tasks";
import type {
  CalendarRecurrence,
  CalendarTask,
  CreateCalendarTaskPayload,
  TaskPriority,
} from "@/types";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const DEFAULT_COLOR = "#10b981";

const RECURRENCE_OPTIONS: { value: CalendarRecurrence; label: string }[] = [
  { value: "none", label: "بدون تكرار" },
  { value: "daily", label: "يومي" },
  { value: "weekly", label: "أسبوعي" },
  { value: "monthly", label: "شهري" },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "منخفضة" },
  { value: "medium", label: "متوسطة" },
  { value: "high", label: "عالية" },
];

interface TaskFormProps {
  editingTask?: CalendarTask | null;
  initialDueAt?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TaskForm({
  editingTask,
  initialDueAt = "",
  onSuccess,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState(initialDueAt);
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [recurrence, setRecurrence] = useState<CalendarRecurrence>("none");
  const [recurrenceEndAt, setRecurrenceEndAt] = useState("");
  const [assigneeIds, setAssigneeIds] = useState<number[]>([]);

  useEffect(() => {
    if (!editingTask) {
      setDueAt(initialDueAt);
      return;
    }
    setTitle(editingTask.title);
    setDescription(editingTask.description ?? "");
    setDueAt(isoToDatetimeLocal(editingTask.due_at));
    setPriority(editingTask.priority);
    setColor(editingTask.color ?? DEFAULT_COLOR);
    setRecurrence(editingTask.recurrence ?? "none");
    setRecurrenceEndAt(
      editingTask.recurrence_end_at
        ? isoToDatetimeLocal(editingTask.recurrence_end_at)
        : "",
    );
    setAssigneeIds(editingTask.assignees.map((a) => a.id));
  }, [editingTask, initialDueAt]);

  const buildPayload = (): CreateCalendarTaskPayload | null => {
    if (!title.trim() || !dueAt) {
      toast.error("العنوان ووقت الاستحقاق مطلوبان");
      return null;
    }

    if (recurrence !== "none" && !recurrenceEndAt) {
      toast.error("تاريخ نهاية التكرار مطلوب");
      return null;
    }

    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      toast.error("لون غير صالح — استخدم صيغة hex مثل #10b981");
      return null;
    }

    if (assigneeIds.length === 0) {
      toast.error("يجب اختيار مُسنَد إليه واحد على الأقل");
      return null;
    }

    return {
      title: title.trim(),
      description: description.trim() || undefined,
      due_at: datetimeLocalToIso(dueAt),
      priority,
      color: color || undefined,
      recurrence: recurrence === "none" ? undefined : recurrence,
      recurrence_end_at:
        recurrence !== "none" && recurrenceEndAt
          ? datetimeLocalToIso(recurrenceEndAt)
          : undefined,
      assignees: assigneeIds,
    };
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload();
      if (!payload) throw new Error("validation");
      if (editingTask) {
        return CalendarTasks_APIs.update(editingTask.id, payload);
      }
      return CalendarTasks_APIs.create(payload);
    },
    onSuccess: () => {
      toast.success(editingTask ? "تم تحديث المهمة" : "تم إنشاء المهمة");
      onSuccess();
    },
    onError: (err) => {
      if (err instanceof Error && err.message === "validation") return;
      toast.error(getApiErrorMessage(err));
    },
  });

  return (
    <div className="calendar-form-panel">
      <div className="calendar-form-panel__header">
        <h3 className="calendar-form-panel__title">
          {editingTask ? "تعديل المهمة" : "مهمة جديدة"}
        </h3>
        <p className="calendar-form-panel__desc">
          {editingTask
            ? "حدّث تفاصيل المهمة والمُسنَد إليهم"
            : "أضف مهمة جديدة وحدّد موعد الاستحقاق والمسؤولين"}
        </p>
      </div>

      <div className="calendar-form-panel__body space-y-4">
      <div className="space-y-2">
        <Label>العنوان</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>الوصف</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>وقت الاستحقاق</Label>
          <DateTimePicker value={dueAt} onChange={setDueAt} />
        </div>
        <div className="space-y-2">
          <Label>الأولوية</Label>
          <Select
            value={priority}
            onValueChange={(value) => setPriority(value as TaskPriority)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ColorPicker value={color} onChange={setColor} />
        <div className="space-y-2">
          <Label>التكرار</Label>
          <Select
            value={recurrence}
            onValueChange={(value) =>
              setRecurrence(value as CalendarRecurrence)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RECURRENCE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {recurrence !== "none" && (
        <div className="space-y-2">
          <Label>نهاية التكرار</Label>
          <DateTimePicker
            value={recurrenceEndAt}
            onChange={setRecurrenceEndAt}
            placeholder="اختر نهاية التكرار"
          />
        </div>
      )}

      <UserMultiSelect
        label="المُسنَد إليهم"
        selectedIds={assigneeIds}
        onChange={setAssigneeIds}
        seedUsers={editingTask?.assignees}
      />
      </div>

      <div className="calendar-form-panel__actions">
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending && (
            <Loader2 className="size-4 animate-spin" />
          )}
          حفظ
        </Button>
        <Button variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </div>
  );
}
