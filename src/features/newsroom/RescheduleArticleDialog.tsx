import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarScheduleRow } from "@/features/calendar/components/CalendarScheduleRow";
import { getApiErrorMessage } from "@/lib/api-data";
import {
  dateToOffsetIso,
  isoToDatetimeLocal,
  parseDatetimeLocal,
} from "@/lib/calendar-datetime";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import type { StaffArticle } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type RescheduleTarget = Pick<StaffArticle, "id" | "title" | "scheduled_for">;

interface RescheduleArticleDialogProps {
  article: RescheduleTarget | null;
  onClose: () => void;
}

export function RescheduleArticleDialog({
  article,
  onClose,
}: RescheduleArticleDialogProps) {
  const queryClient = useQueryClient();
  const [scheduledFor, setScheduledFor] = useState("");

  useEffect(() => {
    if (!article) {
      setScheduledFor("");
      return;
    }
    setScheduledFor(
      article.scheduled_for ? isoToDatetimeLocal(article.scheduled_for) : "",
    );
  }, [article]);

  const mutation = useMutation({
    mutationFn: (value: string) => ArticlesStaff_APIs.reschedule(article!.id, value),
    onSuccess: () => {
      toast.success("تم إعادة جدولة المقال");
      void queryClient.invalidateQueries({ queryKey: ["staff-articles"] });
      void queryClient.invalidateQueries({ queryKey: ["staff-article"] });
      void queryClient.invalidateQueries({ queryKey: ["calendar-feed"] });
      onClose();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const handleSubmit = () => {
    const parsed = parseDatetimeLocal(scheduledFor);
    if (!parsed) {
      toast.error("اختر تاريخ ووقت النشر");
      return;
    }
    if (parsed.getTime() <= Date.now()) {
      toast.error("وقت الجدولة يجب أن يكون في المستقبل");
      return;
    }
    mutation.mutate(dateToOffsetIso(parsed));
  };

  return (
    <Dialog open={!!article} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>إعادة جدولة النشر</DialogTitle>
          <DialogDescription>
            غيّر وقت نشر «{article?.title}» دون إرجاعه إلى مسودة.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <CalendarScheduleRow
            value={scheduledFor}
            onChange={setScheduledFor}
            disabled={mutation.isPending}
            requireFuture
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={mutation.isPending || !scheduledFor}
          >
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            حفظ الموعد
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
