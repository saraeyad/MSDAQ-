import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { inferArticleStep, formatStepProgress } from "@/lib/publish-gate";
import { ROUTES } from "@/router/routes";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import { useQuery } from "@tanstack/react-query";
import { Eye, FileText, PenLine } from "lucide-react";
import { Link } from "react-router-dom";

export default function NewsroomDashboard() {
  const { data } = useQuery({
    queryKey: ["staff-articles", "draft", "mine"],
    queryFn: () =>
      ArticlesStaff_APIs.list({ status: "draft", mine: true, page: 1 }),
  });

  const articles = data?.items ?? [];
  const draftTotal = data?.pagination?.total ?? articles.length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="section-title">مرحباً بك في غرفة الأخبار</h2>
        <p className="section-description">
          ابدأ مقالاً جديداً أو تابع مسوداتك الحالية
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="content-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PenLine className="size-5 text-primary" />
              مقال جديد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              ابدأ مسار النشر الموجّه من البداية
            </p>
            <Button asChild className="mt-4" size="sm">
              <Link to={ROUTES.NEWSROOM_ARTICLE_NEW}>إنشاء</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="content-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-5 text-primary" />
              المسودات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{draftTotal}</p>
            <p className="text-sm text-muted-foreground">مسودة قيد العمل</p>
          </CardContent>
        </Card>
      </div>

      {articles.length > 0 && (
        <div>
          <h3 className="font-semibold">مسودات حديثة</h3>
          <div className="mt-4 space-y-2">
            {articles.slice(0, 5).map((article) => (
              <div
                key={article.id}
                className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-medium">{article.title}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {formatStepProgress(inferArticleStep(article), article.media_type)}
                  </span>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/newsroom/articles/${article.id}`}>
                      <Eye className="size-4" />
                      عرض
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link
                      to={`/newsroom/articles/${article.id}/edit?step=${inferArticleStep(article)}`}
                    >
                      متابعة
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
