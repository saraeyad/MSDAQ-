import Breadcrumbs, { BreadcrumbItem } from "@components/breadcrumbs";
import { UndoIcon } from "lucide-react";
import { FC, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Tooltip from "./tooltip";

interface PageWrapperProps {
  breadcrumbsItems: BreadcrumbItem[];
  children: ReactNode;
  hideBackButton?: boolean;
}

const PageWrapper: FC<PageWrapperProps> = ({
  breadcrumbsItems = [],
  children,
  hideBackButton = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const hideBackBtn = hideBackButton || breadcrumbsItems.length === 1;

  const handleBack = () => {
    const route = breadcrumbsItems[breadcrumbsItems.length - 2]?.path;
    if (route) navigate(route);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Breadcrumbs items={breadcrumbsItems} />

        {!hideBackBtn && (
          <Tooltip title={t("BTN.BACK")}>
            <button
              className="rounded border border-border p-2 transition-colors hover:border-secondary hover:text-secondary"
              onClick={handleBack}
            >
              <UndoIcon className="size-4" />
            </button>
          </Tooltip>
        )}
      </div>
      <div className="min-h-[calc(100vh-12rem)]">{children}</div>
    </div>
  );
};

export default PageWrapper;
