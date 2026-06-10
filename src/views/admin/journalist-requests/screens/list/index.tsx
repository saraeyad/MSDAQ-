import { DataTable } from "@/components/data-table";
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import PageWrapper from "@/components/page-wrapper";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/router/routes";
import type { JournalistRequestStatus } from "@/types/journalist-requests";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import useJournalistRequestsTable from "../../hooks/use-journalist-requests-table";

const STATUS_TABS: Array<JournalistRequestStatus | "all"> = [
  "all",
  "pending",
  "approved",
  "rejected",
];

function RequestsTable({ status }: { status: JournalistRequestStatus | "all" }) {
  const { t } = useTranslation();
  const { table, isLoading, globalSearch, setGlobalSearch } =
    useJournalistRequestsTable(status);

  if (isLoading) return <DataTableSkeleton columnCount={5} rowCount={6} />;

  return (
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
  );
}

export default function JournalistRequestsList() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<JournalistRequestStatus | "all">("all");

  return (
    <PageWrapper
      breadcrumbsItems={[
        { name: t("MENU.ADMIN_DASHBOARD"), path: ROUTES.ADMIN_DASHBOARD },
        { name: t("MENU.JOURNALIST_REQUESTS") },
      ]}
    >
      <div className="space-y-6">
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as JournalistRequestStatus | "all")
          }
        >
          <TabsList>
            {STATUS_TABS.map((status) => (
              <TabsTrigger key={status} value={status}>
                {t(`admin.status.${status}`)}
              </TabsTrigger>
            ))}
          </TabsList>

          {STATUS_TABS.map((status) => (
            <TabsContent key={status} value={status} className="mt-4">
              <RequestsTable status={status} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </PageWrapper>
  );
}
