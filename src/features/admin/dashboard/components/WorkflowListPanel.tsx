import { ROUTES } from "@/router/routes";
import type { ArticleStatus } from "@/types";
import { Link } from "react-router-dom";
import { DashboardChartCard } from "./DashboardChartCard";
import { StatusBadge } from "./StatusBadge";

type WorkflowVariant = "pending_consents" | "reverted" | "scheduled_queue";

const EMPTY_COPY: Record<WorkflowVariant, string> = {
  pending_consents: "لا مقالات معلّقة",
  reverted: "لا شيء للمراجعة",
  scheduled_queue: "لا عناصر مجدولة",
};

interface WorkflowItem {
  id: number;
  title: string;
  author: string;
  scheduled_for?: string;
  revert_reason?: string;
}

interface WorkflowListPanelProps {
  title: string;
  variant: WorkflowVariant;
  items: WorkflowItem[];
  accent?: "primary" | "warning" | "none";
  status?: ArticleStatus;
}

export function WorkflowListPanel({
  title,
  variant,
  items,
  accent = "none",
  status,
}: WorkflowListPanelProps) {
  const isEmpty = items.length === 0;

  return (
    <DashboardChartCard title={title} badge={items.length} accent={accent}>
      {isEmpty ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          {EMPTY_COPY[variant]}
        </p>
      ) : (
        <div className="space-y-2">
          {variant === "scheduled_queue" ? (
            <p className="text-xs text-muted-foreground">التالي للنشر قريباً</p>
          ) : null}
          {items.map((item) => (
            <Link
              key={item.id}
              to={`${ROUTES.NEWSROOM_ARTICLES}/${item.id}`}
              className="admin-workflow-item"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-sm font-medium leading-snug">{item.title}</p>
                {status ? <StatusBadge status={status} /> : null}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.author}
                {item.scheduled_for
                  ? ` · ${new Date(item.scheduled_for).toLocaleString("ar")}`
                  : null}
                {item.revert_reason ? ` · ${item.revert_reason}` : null}
              </p>
            </Link>
          ))}
        </div>
      )}
    </DashboardChartCard>
  );
}
