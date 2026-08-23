import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-data";
import {
  isPublicFeedbackRateLimited,
} from "@/lib/public-feedback-errors";
import { PlatformFeedback_APIs } from "@/services/api/platform-feedback";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PlatformFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlatformFeedbackDialog({
  open,
  onOpenChange,
}: PlatformFeedbackDialogProps) {
  const [comment, setComment] = useState("");

  const submitMutation = useMutation({
    mutationFn: () =>
      PlatformFeedback_APIs.submitPublic({ comment: comment.trim() }),
    onSuccess: () => {
      toast.success("شكراً — تم استلام ملاحظتك");
      setComment("");
      onOpenChange(false);
    },
    onError: (error) => {
      if (isPublicFeedbackRateLimited(error)) {
        onOpenChange(false);
        return;
      }
      toast.error(getApiErrorMessage(error));
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="platform-feedback-dialog sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>شاركنا رأيك</DialogTitle>
          <DialogDescription>
            ما رأيك في منصة مِصداق؟ ملاحظتك مجهولة وتساعدنا على التحسين.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="platform-feedback-comment">ملاحظتك</Label>
          <Textarea
            id="platform-feedback-comment"
            value={comment}
            rows={5}
            disabled={submitMutation.isPending}
            placeholder="اكتب رأيك بحرية..."
            onChange={(event) => setComment(event.target.value)}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={submitMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
          <Button
            disabled={!comment.trim() || submitMutation.isPending}
            onClick={() => submitMutation.mutate()}
          >
            {submitMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            إرسال
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
