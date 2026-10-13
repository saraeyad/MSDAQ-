import {
  ArticleListenButton,
  ArticleListenPlayer,
} from "@/features/publishing-flow/components/ArticleListenButton";
import { PublishGatePanel } from "@/features/publishing-flow/components/PublishGatePanel";
import { StepActionsRow } from "@/features/publishing-flow/components/StepActionsRow";
import {
  CalendarScheduleRow,
  normalizeScheduleDatetime,
} from "@/features/calendar/components/CalendarScheduleRow";
import { Button } from "@/components/ui/button";
import { usePublishGate } from "@/hooks/publishing";
import { getApiErrorMessage } from "@/lib/api";
import {
  dateToUtcIso,
  isoToDatetimeLocal,
  parseDatetimeLocal,
} from "@/lib/calendar";
import { readArticleTtsVoice } from "@/lib/publishing";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import { CalendarClock, CheckCircle2, Loader2, Send, Undo2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const { data: gate, article, isLoading } = usePublishGate(articleId, {
    loadMedia: true,
  });
  const [scheduledFor, setScheduledFor] = useState("");
  const [busyAction, setBusyAction] = useState<"publish" | "schedule" | null>(
    null,
  );
  const [listening, setListening] = useState(false);
  const publishing = busyAction !== null;

  const status = article?.status;
  const isPublished = status === "published";
  const isScheduled = status === "scheduled";
  const canGoLive = !isPublished && !isScheduled;

  useEffect(() => {
    if (!article?.scheduled_for) return;
    setScheduledFor(
      normalizeScheduleDatetime(isoToDatetimeLocal(article.scheduled_for)),
    );
  }, [article?.scheduled_for]);

  const registerNarrationVoice = async () => {
    if (article?.media_type !== "text") return;
    const voice = readArticleTtsVoice(articleId);
    await ArticlesStaff_APIs.textToSpeech(
      articleId,
      voice ? { voice } : {},
    );
  };

  const handlePublish = async () => {
    setBusyAction("publish");
    try {
      await registerNarrationVoice();
      await ArticlesStaff_APIs.publish(articleId);
      toast.success("تم نشر المقال");
      navigate(ROUTES.NEWSROOM_ARTICLES);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setBusyAction(null);
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
    setBusyAction("schedule");
    try {
      await registerNarrationVoice();
      const when = dateToUtcIso(parsed);
      const updated = isScheduled
        ? await ArticlesStaff_APIs.reschedule(articleId, when)
        : await ArticlesStaff_APIs.schedule(articleId, when);
      if (updated) {
        queryClient.setQueryData(["staff-article", articleId], updated);
      } else {
        await queryClient.invalidateQueries({
          queryKey: ["staff-article", articleId],
        });
      }
      toast.success(isScheduled ? "تم إعادة جدولة المقال" : "تم جدولة النشر");
      navigate(ROUTES.NEWSROOM_ARTICLES);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setBusyAction(null);
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
  const needsNarration =
    article?.media_type === "text" && !article.generated_audio?.trim();

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

      <div className="publish-flow-card space-y-3">
        <h3 className="publish-flow-card__title">النسخة الصوتية</h3>
        <p className="text-sm text-muted-foreground">
          {needsNarration
            ? "لا توجد نسخة بعد. نوع الصوت المختار يُرسل الآن، ويبدأ التوليد عند النشر أو عند حلول موعد الجدولة."
            : "استمع إلى نسخة المقال. نوع الصوت المختار يُرسل الآن، ويبدأ التوليد عند النشر."}
        </p>
        <ArticleListenButton
          pressed={listening}
          onClick={() => setListening((open) => !open)}
        />
        {listening ? <ArticleListenPlayer articleId={articleId} /> : null}
      </div>

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
              {busyAction === "publish" && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {busyAction === "publish" ? "جاري النشر" : "نشر الآن"}
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
              اختر اليوم ثم الساعة بتوقيت جهازك. 12 ص = منتصف الليل، 12 م = الظهر.
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
              {busyAction === "schedule" && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {busyAction === "schedule" ? "جاري الجدولة" : "جدولة"}
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
            disabled={!canPublish || !scheduledFor || publishing}
          >
            {busyAction === "schedule" && (
              <Loader2 className="size-4 animate-spin" />
            )}
            {busyAction === "schedule" ? "جاري الجدولة" : "إعادة جدولة"}
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
