import { infoToast } from "@/components/sonner-toast";
import { useJournalistRequestPending } from "@/hooks/useJournalistRequestPending";
import { cn } from "@/lib/utils";
import { PenLine } from "lucide-react";
import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface JournalistRequestButtonProps {
  href: string;
  className?: string;
  onClick?: () => void;
}

export default function JournalistRequestButton({
  href,
  className,
  onClick,
}: JournalistRequestButtonProps) {
  const { t } = useTranslation();
  const { isPending } = useJournalistRequestPending();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (isPending) {
      event.preventDefault();
      infoToast(t("journalistRequest.underReview"));
    }
    onClick?.();
  };

  return (
    <Link
      to={href}
      onClick={handleClick}
      className={cn("journalist-request-btn", className)}
    >
      <span className="journalist-request-btn-icon" aria-hidden>
        <PenLine className="size-3.5" strokeWidth={2.25} />
      </span>
      <span className="journalist-request-btn-label">
        {t("MENU.REQUEST_JOURNALIST")}
      </span>
    </Link>
  );
}
