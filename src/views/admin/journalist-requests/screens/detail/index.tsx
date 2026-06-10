import PageWrapper from "@/components/page-wrapper";
import SectionTitle from "@/components/section-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/router/routes";
import AdminJournalistRequests_APIs from "@/services/api/admin-journalist-requests";
import { parseJournalistRequestDetailResponse } from "@/services/types/admin-journalist-requests";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import RejectDialog from "../../components/reject-dialog";
import useJournalistRequestActions from "../../hooks/use-journalist-request-actions";

export default function JournalistRequestDetail() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const { approve, reject, isApproving, isRejecting } = useJournalistRequestActions(id);

  const { data, isLoading } = useQuery({
    queryKey: ["journalist-request", id],
    enabled: !!id,
    queryFn: async () => {
      const response = await AdminJournalistRequests_APIs.show(id);
      return parseJournalistRequestDetailResponse(response.data);
    },
  });

  const handleApprove = () => {
    approve({
      onSuccess: () => navigate(ROUTES.ADMIN_JOURNALIST_REQUESTS),
    });
  };

  const handleReject = (reason?: string) => {
    reject(reason, {
      onSuccess: () => {
        setIsRejectOpen(false);
        navigate(ROUTES.ADMIN_JOURNALIST_REQUESTS);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <PageWrapper
      breadcrumbsItems={[
        { name: t("MENU.ADMIN_DASHBOARD"), path: ROUTES.ADMIN_DASHBOARD },
        {
          name: t("MENU.JOURNALIST_REQUESTS"),
          path: ROUTES.ADMIN_JOURNALIST_REQUESTS,
        },
        { name: data.fullName },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SectionTitle>{data.fullName}</SectionTitle>
          <Badge>{t(`admin.status.${data.status}`)}</Badge>
        </div>

        <Card>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">{t("COLUMNS.EMAIL")}</p>
              <p className="font-medium">{data.applicantEmail}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("COLUMNS.APPLICANT_NAME")}</p>
              <p className="font-medium">{data.applicantName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("journalistRequest.addressCity")}</p>
              <p className="font-medium">{data.addressCity}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("journalistRequest.addressCountry")}</p>
              <p className="font-medium">{data.addressCountry}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("journalistRequest.affiliationType")}</p>
              <p className="font-medium">{t(`journalistRequest.${data.affiliationType}`)}</p>
            </div>
            {data.outletName ? (
              <div>
                <p className="text-sm text-muted-foreground">{t("journalistRequest.outletName")}</p>
                <p className="font-medium">{data.outletName}</p>
              </div>
            ) : null}
            {data.reviewedBy ? (
              <div>
                <p className="text-sm text-muted-foreground">{t("admin.reviewedBy")}</p>
                <p className="font-medium">{data.reviewedBy}</p>
              </div>
            ) : null}
            {data.reviewedAt ? (
              <div>
                <p className="text-sm text-muted-foreground">{t("admin.reviewedAt")}</p>
                <p className="font-medium">{new Date(data.reviewedAt).toLocaleString()}</p>
              </div>
            ) : null}
            {data.rejectionReason ? (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">{t("admin.rejectReason")}</p>
                <p className="font-medium">{data.rejectionReason}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {data.idPhoto ? (
            <Card>
              <CardContent className="pt-6">
                <p className="mb-3 text-sm font-medium">{t("journalistRequest.idPhoto")}</p>
                <a
                  href={data.idPhoto}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {t("BTN.VIEW_FILE")}
                </a>
              </CardContent>
            </Card>
          ) : null}
          {data.journalismProof ? (
            <Card>
              <CardContent className="pt-6">
                <p className="mb-3 text-sm font-medium">{t("journalistRequest.journalismProof")}</p>
                <a
                  href={data.journalismProof}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {t("BTN.VIEW_FILE")}
                </a>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {data.status === "pending" ? (
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleApprove} disabled={isApproving || isRejecting}>
              {isApproving ? <Loader className="size-4 animate-spin" /> : null}
              {t("BTN.APPROVE")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsRejectOpen(true)}
              disabled={isApproving || isRejecting}
            >
              {t("BTN.REJECT")}
            </Button>
          </div>
        ) : null}
      </div>

      <RejectDialog
        open={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onConfirm={handleReject}
        loading={isRejecting}
      />
    </PageWrapper>
  );
}
