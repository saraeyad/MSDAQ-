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
import { CalendarEvents_APIs } from "@/services/api/calendar-events";
import type {
  CalendarEventRecord,
  CalendarRecurrence,
  CreateCalendarEventRecordPayload,
} from "@/types";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const DEFAULT_COLOR = "#3b82f6";

const RECURRENCE_OPTIONS: { value: CalendarRecurrence; label: string }[] = [
  { value: "none", label: "بدون تكرار" },
  { value: "daily", label: "يومي" },
  { value: "weekly", label: "أسبوعي" },
  { value: "monthly", label: "شهري" },
];

interface EventFormProps {
  editingEvent?: CalendarEventRecord | null;
  initialStartsAt?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EventForm({
  editingEvent,
  initialStartsAt = "",
  onSuccess,
  onCancel,
}: EventFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState(initialStartsAt);
  const [endAt, setEndAt] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [recurrence, setRecurrence] = useState<CalendarRecurrence>("none");
  const [recurrenceEndAt, setRecurrenceEndAt] = useState("");
  const [participantIds, setParticipantIds] = useState<number[]>([]);

  useEffect(() => {
    if (!editingEvent) {
      setStartsAt(initialStartsAt);
      return;
    }
    setTitle(editingEvent.title);
    setDescription(editingEvent.description ?? "");
    setStartsAt(isoToDatetimeLocal(editingEvent.starts_at));
    setEndAt(editingEvent.ends_at ? isoToDatetimeLocal(editingEvent.ends_at) : "");
    setColor(editingEvent.color ?? DEFAULT_COLOR);
    setRecurrence(editingEvent.recurrence ?? "none");
    setRecurrenceEndAt(
      editingEvent.recurrence_end_at
        ? isoToDatetimeLocal(editingEvent.recurrence_end_at)
        : "",
    );
    setParticipantIds(editingEvent.participants.map((p) => p.id));
  }, [editingEvent, initialStartsAt]);

  const buildPayload = (): CreateCalendarEventRecordPayload | null => {
    if (!title.trim() || !startsAt) {
      toast.error("العنوان ووقت البداية مطلوبان");
      return null;
    }

    const startIso = datetimeLocalToIso(startsAt);

    if (endAt) {
      const endIso = datetimeLocalToIso(endAt);
      if (new Date(endIso) <= new Date(startIso)) {
        toast.error("وقت النهاية يجب أن يكون بعد البداية");
        return null;
      }
    }

    if (recurrence !== "none" && !recurrenceEndAt) {
      toast.error("تاريخ نهاية التكرار مطلوب");
      return null;
    }

    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      toast.error("لون غير صالح — استخدم صيغة hex مثل #3b82f6");
      return null;
    }

    return {
      title: title.trim(),
      description: description.trim() || undefined,
      starts_at: startIso,
      ends_at: endAt ? datetimeLocalToIso(endAt) : undefined,
      color: color || undefined,
      recurrence: recurrence === "none" ? undefined : recurrence,
      recurrence_end_at:
        recurrence !== "none" && recurrenceEndAt
          ? datetimeLocalToIso(recurrenceEndAt)
          : undefined,
      participants: participantIds.length > 0 ? participantIds : undefined,
    };
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload();
      if (!payload) throw new Error("validation");
      if (editingEvent) {
        return CalendarEvents_APIs.update(editingEvent.id, payload);
      }
      return CalendarEvents_APIs.create(payload);
    },
    onSuccess: () => {
      toast.success(editingEvent ? "تم تحديث الفعالية" : "تم إنشاء الفعالية");
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
          {editingEvent ? "تعديل الفعالية" : "فعالية جديدة"}
        </h3>
        <p className="calendar-form-panel__desc">
          {editingEvent
            ? "حدّث تفاصيل الفعالية والمشاركين"
            : "أضف فعالية جديدة وحدّد وقت البداية والنهاية"}
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
          <Label>وقت البداية</Label>
          <DateTimePicker value={startsAt} onChange={setStartsAt} />
        </div>
        <div className="space-y-2">
          <Label>وقت النهاية (اختياري)</Label>
          <DateTimePicker
            value={endAt}
            onChange={setEndAt}
            placeholder="اختر وقت النهاية"
          />
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
        label="المشاركون"
        selectedIds={participantIds}
        onChange={setParticipantIds}
        seedUsers={editingEvent?.participants}
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
