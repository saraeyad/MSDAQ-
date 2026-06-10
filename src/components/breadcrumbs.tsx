import i18n from "@/i18n";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

export type BreadcrumbItem = {
  name: string;
  path?: string;
};

const Breadcrumbs = ({ items }: { items?: BreadcrumbItem[] }) => {
  const { t } = useTranslation();
  const location = useLocation();

  const defaultItems: BreadcrumbItem[] = location.pathname
    .split("/")
    .filter(Boolean)
    .map((segment, index, arr) => {
      const key = `BREADCRUMB.${segment.toUpperCase()}`;
      const translated = t(key);
      const name = typeof translated === "string" ? translated : segment;

      return {
        name,
        path: "/" + arr.slice(0, index + 1).join("/"),
      };
    });

  const breadcrumbs = items || defaultItems;

  if (breadcrumbs.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-body-md text-muted-foreground select-none">
      {breadcrumbs.map((crumb, index) => (
        <Fragment key={crumb.path ?? index}>
          {index > 0 && (
            <span className="text-border">{i18n.dir() === "rtl" ? "/" : "\\"}</span>
          )}
          {crumb.path ? (
            <Link to={crumb.path} className="transition-colors hover:text-secondary">
              {typeof crumb.name === "string" ? crumb.name : String(crumb.name)}
            </Link>
          ) : (
            <span className="line-clamp-1 font-medium text-foreground">{crumb.name}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
