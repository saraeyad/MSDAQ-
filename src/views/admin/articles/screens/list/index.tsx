import { DataTable } from "@/components/data-table";
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import PageWrapper from "@/components/page-wrapper";
import SectionTitle from "@/components/section-title";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/router/routes";
import { useTranslation } from "react-i18next";
import useAdminArticlesTable from "../../hooks/use-admin-articles-table";

export default function AdminArticlesList() {
  const { t } = useTranslation();
  const { table, isLoading, globalSearch, setGlobalSearch } = useAdminArticlesTable();

  return (
    <PageWrapper
      breadcrumbsItems={[
        { name: t("MENU.ADMIN_DASHBOARD"), path: ROUTES.ADMIN_DASHBOARD },
        { name: t("MENU.ARTICLE_REVIEW") },
      ]}
    >
      <div className="space-y-6">
        <SectionTitle>{t("admin.articleReview.title")}</SectionTitle>
        <p className="text-sm text-muted-foreground">
          {t("admin.articleReview.description")}
        </p>

        {isLoading ? (
          <DataTableSkeleton columnCount={6} rowCount={5} />
        ) : (
          <DataTable table={table}>
            <DataTableAdvancedToolbar table={table}>
              <Input
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder={t("BTN.SEARCH")}
                className="max-w-sm"
              />
            </DataTableAdvancedToolbar>
          </DataTable>
        )}
      </div>
    </PageWrapper>
  );
}
