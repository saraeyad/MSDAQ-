import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/auth";
import { AdminEmptyState } from "@/features/admin/components/AdminEmptyState";
import { AdminLoadingState } from "@/features/admin/components/AdminLoadingState";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { ArticlesSection } from "@/features/admin/dashboard/ArticlesSection";
import { OverviewSection } from "@/features/admin/dashboard/OverviewSection";
import { PeopleRecentSection } from "@/features/admin/dashboard/PeopleRecentSection";
import { WorkflowSection } from "@/features/admin/dashboard/WorkflowSection";
import { AdminDashboard_APIs } from "@/services/api/admin";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard } from "lucide-react";
import { useState } from "react";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [days, setDays] = useState("30");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-dashboard", days],
    queryFn: () => AdminDashboard_APIs.get(Number(days)),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const daysSelect = (
    <Select value={days} onValueChange={setDays}>
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7">7 أيام</SelectItem>
        <SelectItem value="30">30 يوماً</SelectItem>
        <SelectItem value="90">90 يوماً</SelectItem>
      </SelectContent>
    </Select>
  );

  if (isLoading) {
    return <AdminLoadingState variant="dashboard" />;
  }

  if (isError || !data) {
    return (
      <AdminEmptyState
        icon={LayoutDashboard}
        title="تعذّر تحميل لوحة الإدارة"
        description="تحقق من الاتصال أو الصلاحيات ثم أعد المحاولة."
      />
    );
  }

  const { overview, articles, workflow, people, recent } = data;

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title={`مرحباً، ${user?.name?.split(" ")[0] ?? "مدير"}`}
        description="نظرة عامة على نشاط الفريق والصحة التشغيلية"
        actions={daysSelect}
      />

      <WorkflowSection workflow={workflow} />
      <OverviewSection
        overview={overview}
        publishingTrend={articles.publishing_trend}
      />
      <ArticlesSection articles={articles} days={days} />
      <PeopleRecentSection people={people} recent={recent} />
    </div>
  );
}
