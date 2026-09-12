import { PublishGatePanel } from "@/features/publishing-flow/components/PublishGatePanel";
import { StepActionsRow } from "@/features/publishing-flow/components/StepActionsRow";
import { CalendarScheduleRow } from "@/features/calendar/components/CalendarScheduleRow";
import { Button } from "@/components/ui/button";
import { usePublishGate } from "@/hooks/publishing";
import { getApiErrorMessage } from "@/lib/api";
import {
  dateToOffsetIso,
  isoToDatetimeLocal,
  parseDatetimeLocal,
} from "@/lib/calendar";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import { CalendarClock, CheckCircle2, Loader2, Send, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ROUTES } from "@/router/routes";

interface Step7PublishProps {
  articleId: number | string;
  onBack?: () => void;
}

export function Step7Publish({ articleId, onBack }: Step7PublishProps) {
  const navigate = useNavigate();
  const { data: gate, article, isLoading } = usePublishGate(articleId);
  const [scheduledFor, setScheduledFor] = useState("");
  const [publishing, setPublishing] = useState(false);

  const status = article?.status;
  const isPublished = status === "published";
  const isScheduled = status === "scheduled";
  const canGoLive = !isPublished && !isScheduled;

  useEffect(() => {
    if (!article?.scheduled_for) return;
    setScheduledFor(isoToDatetimeLocal(article.scheduled_for));
  }, [article?.scheduled_for]);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await ArticlesStaff_APIs.publish(articleId);
      toast.success("تم نشر المقال");
      navigate(ROUTES.NEWSROOM_ARTICLES);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setPublishing(false);
    }
  };

  const handleSchedule = async () => {
    const parsed = parseDatetimeLocal(scheduledFor);
    if (!parsed) {
      toast.error("اختر تاريخ ووقت النشر");
      return;
    }
    if (parsed.getTime() <= Date.now()) {
      toast.error("وقت الجدولة يجب أن يكون في المستقبل");
      return;
    }
    setPublishing(true);
    try {
      const when = dateToOffsetIso(parsed);
      if (isScheduled) {
        await ArticlesStaff_APIs.reschedule(articleId, when);
        toast.success("تم إعادة جدولة المقال");
      } else {
        await ArticlesStaff_APIs.schedule(articleId, when);
        toast.success("تم جدولة النشر");
      }
      navigate(ROUTES.NEWSROOM_ARTICLES);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setPublishing(false);
    }
  };

  const handleRevert = async () => {
    try {
      await ArticlesStaff_APIs.revert(articleId);
      toast.success("تم إخفاء المقال عن الجمهور وإرجاعه إلى مسودة");
      navigate(ROUTES.NEWSROOM_ARTICLES);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const canPublish = Boolean(gate?.can_publish) && !publishing;

  return (
    <div className="space-y-6">
      <PublishGatePanel gate={gate} isLoading={isLoading} />

      {isPublished ? (
        <div className="publish-flow-card publish-step-publish__card">
          <div className="publish-step-publish__header">
            <span className="publish-step-publish__icon" aria-hidden>
              <CheckCircle2 className="size-4" />
            </span>
            <h3 className="publish-flow-card__title">المقال منشور</h3>
          </div>
          <p className="publish-step-publish__lead">
            التعديلات تُحفظ على المقال الحالي دون تغيير تاريخ النشر الأصلي.
            استخدم «إرجاع إلى مسودة» فقط إذا أردت إخفاءه عن الجمهور.
          </p>
          {article?.published_at ? (
            <p className="text-sm text-muted-foreground">
              نُشر: {new Date(article.published_at).toLocaleString("ar")}
            </p>
          ) : null}
        </div>
      ) : null}

      {canGoLive ? (
        <div className="publish-step-publish">
          <div className="publish-flow-card publish-step-publish__card">
            <div className="publish-step-publish__header">
              <span className="publish-step-publish__icon" aria-hidden>
                <Send className="size-4" />
              </span>
              <h3 className="publish-flow-card__title">نشر فوري</h3>
            </div>
            <p className="publish-step-publish__lead">
              يظهر المقال للجمهور مباشرة بعد التأكد من جاهزية بوابة النشر.
            </p>
            <Button onClick={() => void handlePublish()} disabled={!canPublish}>
              {publishing && <Loader2 className="size-4 animate-spin" />}
              نشر الآن
            </Button>
          </div>

          <div className="publish-flow-card publish-step-publish__card">
            <div className="publish-step-publish__header">
              <span className="publish-step-publish__icon" aria-hidden>
                <CalendarClock className="size-4" />
              </span>
              <h3 className="publish-flow-card__title">جدولة النشر</h3>
            </div>
            <p className="publish-step-publish__lead">
              اختر اليوم ثم الساعة (بتوقيت جهازك) — يُرسل الوقت مع المنطقة الزمنية.
            </p>
            <CalendarScheduleRow
              value={scheduledFor}
              onChange={setScheduledFor}
              disabled={publishing}
              requireFuture
            />
            <Button
              variant="outline"
              onClick={() => void handleSchedule()}
              disabled={!canPublish || !scheduledFor}
            >
              {publishing && <Loader2 className="size-4 animate-spin" />}
              جدولة
            </Button>
          </div>
        </div>
      ) : null}

      {isScheduled ? (
        <div className="publish-flow-card publish-step-publish__card">
          <div className="publish-step-publish__header">
            <span className="publish-step-publish__icon" aria-hidden>
              <CalendarClock className="size-4" />
            </span>
            <h3 className="publish-flow-card__title">إعادة الجدولة</h3>
          </div>
          <p className="publish-step-publish__lead">
            غيّر موعد النشر دون نشر المقال فوراً.
          </p>
          <CalendarScheduleRow
            value={scheduledFor}
            onChange={setScheduledFor}
            disabled={publishing}
            requireFuture
          />
          <Button
            variant="outline"
            onClick={() => void handleSchedule()}
            disabled={!canPublish || !scheduledFor}
          >
            {publishing && <Loader2 className="size-4 animate-spin" />}
            إعادة جدولة
          </Button>
        </div>
      ) : null}

      {(isPublished || isScheduled) && (
        <Button variant="destructive" onClick={() => void handleRevert()}>
          <Undo2 className="size-4" />
          إرجاع إلى مسودة
        </Button>
      )}

      <StepActionsRow onBack={onBack} />
    </div>
  );
}
