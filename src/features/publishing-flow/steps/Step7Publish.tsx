import { PublishGatePanel } from "@/features/publishing-flow/components/PublishGatePanel";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Label } from "@/components/ui/label";
import { usePublishGate } from "@/hooks/usePublishGate";
import { getApiErrorMessage } from "@/lib/api-data";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ROUTES } from "@/router/routes";

interface Step7PublishProps {
  articleId: number;
}

export function Step7Publish({ articleId }: Step7PublishProps) {
  const navigate = useNavigate();
  const { data: gate, article, isLoading } = usePublishGate(articleId);
  const [scheduledFor, setScheduledFor] = useState("");
  const [publishing, setPublishing] = useState(false);

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
    if (!scheduledFor) return;
    setPublishing(true);
    try {
      const iso = new Date(scheduledFor).toISOString();
      await ArticlesStaff_APIs.schedule(articleId, iso);
      toast.success("تم جدولة النشر");
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
      toast.success("تم إرجاع المقال إلى مسودة");
      navigate(ROUTES.NEWSROOM_ARTICLES);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <PublishGatePanel gate={gate} isLoading={isLoading} />

      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold">نشر فوري</h3>
        <Button
          onClick={handlePublish}
          disabled={publishing || !gate?.can_publish}
        >
          {publishing && <Loader2 className="size-4 animate-spin" />}
          نشر الآن
        </Button>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold">جدولة النشر</h3>
        <div className="space-y-2">
          <Label>تاريخ ووقت النشر</Label>
          <DateTimePicker
            value={scheduledFor}
            onChange={setScheduledFor}
            placeholder="اختر تاريخ ووقت النشر"
          />
        </div>
        <Button
          variant="outline"
          onClick={handleSchedule}
          disabled={publishing || !gate?.can_publish || !scheduledFor}
        >
          جدولة
        </Button>
      </div>

      {(article?.status === "published" || article?.status === "scheduled") && (
        <Button variant="destructive" onClick={handleRevert}>
          إرجاع إلى مسودة
        </Button>
      )}
    </div>
  );
}
