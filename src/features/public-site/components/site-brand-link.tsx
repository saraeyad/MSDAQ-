import { BrandLogo } from "@/components/brand-logo";
import { usePublicCopy } from "@/context/locale";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/router/routes";
import { Link } from "react-router-dom";

export function SiteBrandLink({
  className,
  linkToHome = false,
}: {
  className?: string;
  linkToHome?: boolean;
}) {
  const { brand } = usePublicCopy();

  const logo = (
    <BrandLogo
      linkToHome={false}
      size="xl"
      className={cn("site-brand-link__logo", className)}
    />
  );

  if (linkToHome) {
    return (
      <Link
        to={ROUTES.HOME}
        className="site-brand-link site-brand-link--home"
        aria-label={brand.homeAria}
      >
        {logo}
      </Link>
    );
  }

  return (
    <span className="site-brand-link" aria-hidden="true">
      {logo}
    </span>
  );
}

export const NavGhazawiyaLink = SiteBrandLink;
