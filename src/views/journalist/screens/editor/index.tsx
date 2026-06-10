import PageWrapper from "@/components/page-wrapper";
import SectionTitle from "@/components/section-title";
import { ROUTES } from "@/router/routes";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import EditorForm from "../../components/editor-form";

export default function SmartEditor() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const articleId = searchParams.get("id")
    ? Number(searchParams.get("id"))
    : undefined;

  return (
    <div className="smart-editor-page -mx-4 -mt-6 px-4 pb-8 pt-6 md:-mx-0 md:px-0">
      <PageWrapper
        breadcrumbsItems={[
          { name: t("MENU.JOURNALIST_DASHBOARD"), path: ROUTES.JOURNALIST_DASHBOARD },
          { name: t("MENU.SMART_EDITOR") },
        ]}
      >
        <div className="relative z-[1] space-y-6">
          <div>
            <SectionTitle>{t("journalist.editor.title_page")}</SectionTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("journalist.editor.description")}
            </p>
          </div>
          <EditorForm articleId={articleId} />
        </div>
      </PageWrapper>
    </div>
  );
}
