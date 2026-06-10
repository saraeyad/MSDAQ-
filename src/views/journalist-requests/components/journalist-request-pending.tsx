import { Button } from "@/components/ui/button";
import { ROUTES } from "@/router/routes";
import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function JournalistRequestPending() {
  const { t } = useTranslation();

  return (
    <div className="journalist-apply-form-card journalist-apply-pending-card">
      <div className="journalist-apply-pending-icon" aria-hidden>
        <Clock className="size-8 text-secondary" />
      </div>
      <h3 className="font-headline text-2xl font-semibold text-foreground">
        {t("journalistRequest.pendingReviewTitle")}
      </h3>
      <p className="mt-3 max-w-md text-body-md leading-relaxed text-muted-foreground">
        {t("journalistRequest.pendingReviewDescription")}
      </p>
      <Button variant="outline" className="mt-8" asChild>
        <Link to={ROUTES.HOME}>{t("journalistRequest.backToHome")}</Link>
      </Button>
    </div>
  );
}
