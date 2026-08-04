import type { AdminDashboardWorkflow } from "@/types";
import { WorkflowListPanel } from "./components/WorkflowListPanel";

interface WorkflowSectionProps {
  workflow: AdminDashboardWorkflow;
}

export function WorkflowSection({ workflow }: WorkflowSectionProps) {
  const totalItems =
    workflow.pending_consents.length +
    workflow.reverted.length +
    workflow.scheduled_queue.length;

  if (totalItems === 0) return null;

  return (
    <section className="space-y-3">
      <div>
        <h3 className="admin-section-title">يحتاج انتباه</h3>
        <p className="admin-section-desc">
          عناصر تحتاج إجراء — موافقات، مُعادة، أو مجدولة
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <WorkflowListPanel
          title="موافقات مصادر معلّقة"
          variant="pending_consents"
          items={workflow.pending_consents}
          accent="warning"
        />
        <WorkflowListPanel
          title="مُعادة (فشل النشر)"
          variant="reverted"
          items={workflow.reverted}
          accent="warning"
          status="reverted"
        />
        <WorkflowListPanel
          title="قائمة المجدولة"
          variant="scheduled_queue"
          items={workflow.scheduled_queue}
          accent="primary"
          status="scheduled"
        />
      </div>
    </section>
  );
}
