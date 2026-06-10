import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/router/routes";
import type { JournalistArticle } from "@/types/journalist-article";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function useAdminArticlesColumns() {
  const { t } = useTranslation();

  const columns = useMemo<ColumnDef<JournalistArticle>[]>(
    () => [
      {
        id: "title",
        accessorKey: "title",
        header: t("COLUMNS.TITLE"),
      },
      {
        id: "trustScore",
        accessorKey: "trustScore",
        header: t("scores.trust"),
        cell: ({ row }) => row.original.trustScore ?? "-",
      },
      {
        id: "credibilityScore",
        accessorKey: "credibilityScore",
        header: t("scores.credibility"),
        cell: ({ row }) => row.original.credibilityScore ?? "-",
      },
      {
        id: "status",
        accessorKey: "status",
        header: t("COLUMNS.STATUS"),
        cell: () => (
          <Badge variant="outline">{t("admin.articleReview.pending")}</Badge>
        ),
      },
      {
        id: "submittedAt",
        accessorKey: "submittedAt",
        header: t("COLUMNS.SUBMITTED_AT"),
        cell: ({ row }) =>
          row.original.submittedAt
            ? new Date(row.original.submittedAt).toLocaleString()
            : "-",
      },
      {
        id: "actions",
        accessorKey: "actions",
        header: t("COLUMNS.ACTIONS"),
        enableHiding: false,
        cell: ({ row }) => (
          <Button variant="outline" size="sm" asChild>
            <Link to={ROUTES.ADMIN_ARTICLE_DETAIL(row.original.id)}>
              {t("BTN.REVIEW")}
            </Link>
          </Button>
        ),
      },
    ],
    [t]
  );

  return { columns };
}
