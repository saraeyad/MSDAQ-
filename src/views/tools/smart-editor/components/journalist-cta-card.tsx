import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { ROUTES } from "@/router/routes";
import { Lock, PenLine } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function JournalistCtaCard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isJournalist = user?.role === "journalist";

  return (
    <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-5 shadow-sm">
      <div className="space-y-4 text-center">
        {isJournalist ? (
          <>
            <p className="text-sm font-medium text-foreground">
              {t("smartEditor.journalistReady")}
            </p>
            <Button className="w-full sm:w-auto" asChild>
              <Link to={ROUTES.JOURNALIST_EDITOR}>
                <PenLine className="size-4" />
                {t("home.tools.editor.ctaJournalist")}
              </Link>
            </Button>
          </>
        ) : (
          <>
            <Lock className="mx-auto size-7 text-secondary" />
            <p className="text-sm font-medium text-foreground">
              {t("smartEditor.gatedTitle")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("smartEditor.gatedDescription")}
            </p>
            <Button className="w-full sm:w-auto" asChild>
              <Link to={ROUTES.JOURNALIST_APPLY}>{t("smartEditor.applyNow")}</Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              {t("smartEditor.loginHint")}{" "}
              <Link to={ROUTES.LOGIN} className="text-secondary underline">
                {t("auth.login")}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
