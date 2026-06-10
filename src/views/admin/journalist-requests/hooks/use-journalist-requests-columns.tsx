import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/router/routes";
import type { JournalistRequestListItem } from "@/types/journalist-requests";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

function getStatusVariant(status: JournalistRequestListItem["status"]) {
  if (status === "approved") return "default";
  if (status === "rejected") return "destructive";
  return "secondary";
}

export default function useJournalistRequestsColumns() {
  const { t } = useTranslation();

  const columns = useMemo<ColumnDef<JournalistRequestListItem>[]>(
    () => [
      {
        id: "applicantName",
        accessorKey: "applicantName",
        header: t("COLUMNS.APPLICANT_NAME"),
      },
      {
        id: "applicantEmail",
        accessorKey: "applicantEmail",
        header: t("COLUMNS.EMAIL"),
      },
      {
        id: "status",
        accessorKey: "status",
        header: t("COLUMNS.STATUS"),
        cell: ({ row }) => (
          <Badge variant={getStatusVariant(row.original.status)}>
            {t(`admin.status.${row.original.status}`)}
          </Badge>
        ),
      },
      {
        id: "submittedAt",
        accessorKey: "submittedAt",
        header: t("COLUMNS.SUBMITTED_AT"),
        cell: ({ row }) => new Date(row.original.submittedAt).toLocaleString(),
      },
      {
        id: "actions",
        accessorKey: "actions",
        header: t("COLUMNS.ACTIONS"),
        enableHiding: false,
        cell: ({ row }) => (
          <Button variant="outline" size="sm" asChild>
            <Link to={ROUTES.ADMIN_JOURNALIST_REQUEST_DETAIL(row.original.id)}>
              {t("BTN.VIEW")}
            </Link>
          </Button>
        ),
      },
    ],
    [t],
  );

  return { columns };
}
