import PageWrapper from "@/components/page-wrapper";
import SectionTitle from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/router/routes";
import type { JournalistArticleStatus } from "@/types/journalist-article";
import { Loader, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import ArchiveCard from "../../components/archive-card";
import useArchiveArticles from "../../hooks/useArchiveTable";

const TABS: Array<JournalistArticleStatus | "all"> = [
  "all",
  "draft",
  "pending",
  "published",
  "rejected",
];

function isValidTab(tab: string | null): tab is JournalistArticleStatus | "all" {
  return tab !== null && TABS.includes(tab as JournalistArticleStatus | "all");
}

function ArchiveList({ status }: { status: JournalistArticleStatus | "all" }) {
  const { t } = useTranslation();
  const { data, isLoading } = useArchiveArticles(status);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">{t("journalist.dashboard.emptyArchive")}</p>
        <Button className="mt-4" asChild>
          <Link to={ROUTES.JOURNALIST_EDITOR}>
            <Plus className="size-4" />
            {t("journalist.archive.newArticle")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.map((article) => (
        <ArchiveCard key={article.id} article={article} />
      ))}
    </div>
  );
}

export default function JournalistArchive() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<JournalistArticleStatus | "all">(
    isValidTab(tabParam) ? tabParam : "all",
  );

  useEffect(() => {
    if (isValidTab(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    <PageWrapper
      breadcrumbsItems={[
        { name: t("MENU.JOURNALIST_DASHBOARD"), path: ROUTES.JOURNALIST_DASHBOARD },
        { name: t("MENU.MY_ARTICLES") },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <SectionTitle>{t("journalist.archive.title")}</SectionTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("journalist.archive.description")}
            </p>
          </div>
          <Button asChild>
            <Link to={ROUTES.JOURNALIST_EDITOR}>
              <Plus className="size-4" />
              {t("journalist.archive.newArticle")}
            </Link>
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as JournalistArticleStatus | "all")}
        >
          <TabsList>
            {TABS.map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {t(`journalist.archive.status.${tab}`)}
              </TabsTrigger>
            ))}
          </TabsList>
          {TABS.map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              <ArchiveList status={tab} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </PageWrapper>
  );
}
