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
import {
  CalendarScheduleRow,
  normalizeScheduleDatetime,
} from "@/features/calendar/components/CalendarScheduleRow";
import { ColorPicker } from "@/features/calendar/components/ColorPicker";
import { UserMultiSelect } from "@/features/calendar/components/UserMultiSelect";
import {
  datetimeLocalToIso,
  defaultEndDatetimeLocal,
  isoToDatetimeLocal,
  parseDatetimeLocal,
} from "@/lib/calendar-datetime";
import { CALENDAR_TYPE_COLORS } from "@/lib/calendar-feed";
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

const DEFAULT_COLOR: string = CALENDAR_TYPE_COLORS.event;

const RECURRENCE_OPTIONS: { value: CalendarRecurrence; label: string }[] = [
  { value: "none", label: "بدون تكرار" },
  { value: "daily", label: "يومي" },
  { value: "weekly", label: "أسبوعي" },
  { value: "monthly", label: "شهري" },
];

interface EventFormProps {
  editingEvent?: CalendarEventRecord | null;
  initialStartsAt?: string;
  dateLocked?: boolean;
  embedded?: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EventForm({
  editingEvent,
  initialStartsAt = "",
  dateLocked = false,
  embedded = false,
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
      const normalizedStart = initialStartsAt
        ? normalizeScheduleDatetime(initialStartsAt)
        : "";
      setStartsAt(normalizedStart);
      setEndAt(
        normalizedStart ? defaultEndDatetimeLocal(normalizedStart, 60) : "",
      );
      return;
    }
    setTitle(editingEvent.title);
    setDescription(editingEvent.description ?? "");
    const normalizedStart = normalizeScheduleDatetime(
      isoToDatetimeLocal(editingEvent.starts_at),
    );
    setStartsAt(normalizedStart);
    setEndAt(
      editingEvent.ends_at
        ? normalizeScheduleDatetime(isoToDatetimeLocal(editingEvent.ends_at))
        : defaultEndDatetimeLocal(normalizedStart, 60),
    );
    setColor(editingEvent.color ?? DEFAULT_COLOR);
    setRecurrence(editingEvent.recurrence ?? "none");
    setRecurrenceEndAt(
      editingEvent.recurrence_end_at
        ? isoToDatetimeLocal(editingEvent.recurrence_end_at)
        : "",
    );
    setParticipantIds(editingEvent.participants.map((p) => p.id));
  }, [editingEvent, initialStartsAt]);

  const handleStartsAtChange = (value: string) => {
    setStartsAt(value);
    if (!value) {
      setEndAt("");
      return;
    }

    const end = parseDatetimeLocal(endAt);
    const start = parseDatetimeLocal(value);
    if (!end || !start || end <= start) {
      setEndAt(defaultEndDatetimeLocal(value, 60));
    }
  };

  const handleEndAtChange = (value: string) => {
    const start = parseDatetimeLocal(startsAt);
    const end = parseDatetimeLocal(value);
    if (start && end && end <= start) {
      setEndAt(defaultEndDatetimeLocal(startsAt, 60));
      return;
    }
    setEndAt(value);
  };

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

  const formBody = (
    <>
      <div className="calendar-form-fields">
        <div className="calendar-form-field calendar-form-field--title">
          <Label className="calendar-form-field__label">العنوان</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="calendar-form-title-input"
            placeholder="أدخل عنوان الفعالية"
          />
        </div>

        <div className="calendar-form-field">
          <Label className="calendar-form-field__label">الوصف</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="calendar-form-textarea min-h-24 resize-y"
            placeholder="أضف وصفاً (اختياري)"
          />
        </div>

        <div className="calendar-form-field calendar-form-field--meta">
          <Label className="calendar-form-field__label">الوقت</Label>
          <div className="calendar-form-meta">
            <CalendarScheduleRow
              value={startsAt}
              onChange={handleStartsAtChange}
              endValue={endAt}
              onEndChange={handleEndAtChange}
              showEndTime
              dateLocked={dateLocked}
            />
          </div>
        </div>

        <div className="calendar-form-row">
          <ColorPicker compact value={color} onChange={setColor} />
          <div className="calendar-form-field">
            <Label className="calendar-form-field__label">التكرار</Label>
            <Select
              value={recurrence}
              onValueChange={(value) =>
                setRecurrence(value as CalendarRecurrence)
              }
            >
              <SelectTrigger className="calendar-form-select w-full">
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
          <div className="calendar-form-field">
            <Label className="calendar-form-field__label">نهاية التكرار</Label>
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

      <div
        className={
          embedded
            ? "calendar-create-dialog__footer"
            : "calendar-form-panel__actions"
        }
      >
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
    </>
  );

  if (embedded) {
    return <div className="calendar-create-dialog__form">{formBody}</div>;
  }

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
      {formBody}
    </div>
  );
}
