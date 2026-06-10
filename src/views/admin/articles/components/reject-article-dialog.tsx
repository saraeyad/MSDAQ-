import SharedDialog from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface RejectArticleDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  loading?: boolean;
}

export default function RejectArticleDialog({
  open,
  onClose,
  onConfirm,
  loading = false,
}: RejectArticleDialogProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason.trim() || undefined);
    setReason("");
  };

  return (
    <SharedDialog open={open} onClose={onClose} title={t("admin.articleReview.rejectTitle")}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t("admin.articleReview.rejectDescription")}
        </p>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t("admin.articleReview.rejectPlaceholder")}
          rows={4}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t("BTN.CANCEL")}
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
            {loading ? <Loader className="size-4 animate-spin" /> : null}
            {t("BTN.REJECT")}
          </Button>
        </div>
      </div>
    </SharedDialog>
  );
}
