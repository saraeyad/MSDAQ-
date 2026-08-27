import { SabbaraBrandIcon } from "@/components/ghazawiya/sabbara-cactus";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/router/routes";
import { Link } from "react-router-dom";

function GhazawiyaMark() {
  return (
    <>
      <SabbaraBrandIcon className="nav-ghazawiya__mark" />
      <span className="nav-ghazawiya__text">صبارة بوست</span>
    </>
  );
}

export function SiteBrandLink({
  className,
  linkToHome = false,
}: {
  className?: string;
  linkToHome?: boolean;
}) {
  if (linkToHome) {
    return (
      <Link
        to={ROUTES.HOME}
        className={cn("nav-ghazawiya nav-ghazawiya--link", className)}
        aria-label="صبارة بوست — العودة للرئيسية"
      >
        <GhazawiyaMark />
      </Link>
    );
  }

  return (
    <span className={cn("nav-ghazawiya", className)} aria-hidden="true">
      <GhazawiyaMark />
    </span>
  );
}

export const NavGhazawiyaLink = SiteBrandLink;
