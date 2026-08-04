import { publicMediaTypeLabel } from "@/lib/media-labels";
import type {
  AdminDashboardPeople,
  AdminDashboardRecentArticle,
} from "@/types";
import { Link } from "react-router-dom";
import { ROUTES } from "@/router/routes";
import { DashboardChartCard } from "./components/DashboardChartCard";
import { HorizontalBarChartCard } from "./components/HorizontalBarChartCard";

interface PeopleRecentSectionProps {
  people: AdminDashboardPeople;
  recent: AdminDashboardRecentArticle[];
}

export function PeopleRecentSection({
  people,
  recent,
}: PeopleRecentSectionProps) {
  const authorData = people.top_authors.map((author) => ({
    name: author.name,
    value: author.count,
  }));

  return (
    <section className="space-y-3">
      <h3 className="admin-section-title">الفريق والمنشورات</h3>

      <div className="grid gap-4 lg:grid-cols-2">
        <HorizontalBarChartCard
          title="أبرز الكتّاب"
          subtitle="عدد المنشورات لكل كاتب"
          data={authorData}
          emptyMessage="لا بيانات عن الكتّاب بعد."
        />

        <DashboardChartCard title="آخر المنشورات" subtitle="أحدث المقالات المنشورة">
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              لا منشورات بعد.
            </p>
          ) : (
            <ul className="admin-recent-list">
              {recent.slice(0, 6).map((item) => (
                <li key={item.id}>
                  <Link
                    to={`${ROUTES.NEWSROOM_ARTICLES}/${item.id}`}
                    className="admin-recent-list__item"
                  >
                    <div className="min-w-0">
                      <p className="admin-recent-list__title">{item.title}</p>
                      <p className="admin-recent-list__meta">
                        {publicMediaTypeLabel(item.media_type)}
                        {" · "}
                        {item.category.name_ar}
                      </p>
                    </div>
                    <time className="admin-recent-list__date">
                      {new Date(item.published_at).toLocaleDateString("ar")}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DashboardChartCard>
      </div>
    </section>
  );
}
