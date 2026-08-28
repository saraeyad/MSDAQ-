import { ArticleVerifiedBadge } from "@/components/article-verified-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminEmptyState } from "@/features/admin/components/AdminEmptyState";
import { AdminLoadingState } from "@/features/admin/components/AdminLoadingState";
import { AdminPagination } from "@/features/admin/components/AdminPagination";
import { StatusBadge } from "@/features/admin/components/StatusBadge";
import { RescheduleArticleDialog } from "@/features/newsroom/RescheduleArticleDialog";
import { CategoryFlyoutFilter } from "@/features/newsroom/CategoryFlyoutFilter";
import { usePermission } from "@/hooks/usePermission";
import { getApiErrorMessage } from "@/lib/api-data";
import { paginateList, TABLE_PAGE_SIZE } from "@/lib/table-pagination";
import { mediaTypeLabel } from "@/lib/media-labels";
import { resolveMediaUrl } from "@/lib/media-url";
import { formatStepProgress, inferArticleStep } from "@/lib/publish-gate";
import { cn } from "@/lib/utils";
import {
  PERMISSIONS,
  ROUTES,
  staffArticleEditPath,
  staffArticlePath,
  staffArticleTrustFeedbackPath,
} from "@/router/routes";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import { PublicCategories_APIs } from "@/services/api/public-categories";
import type { ArticleStatus, StaffArticle } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  CalendarClock,
  Eye,
  FileText,
  PenLine,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const STATUS_OPTIONS: { value: ArticleStatus | "all"; label: string }[] = [
  { value: "all", label: "كل الحالات" },
  { value: "draft", label: "مسودة" },
  { value: "scheduled", label: "مجدول" },
  { value: "published", label: "منشور" },
];

function StaffArticleCard({
  article,
  canEdit,
  canDelete,
  canReschedule,
  canViewTrustIndex,
  onDelete,
  onReschedule,
}: {
  article: StaffArticle;
  canEdit: boolean;
  canDelete: boolean;
  canReschedule: boolean;
  canViewTrustIndex: boolean;
  onDelete: (article: StaffArticle) => void;
  onReschedule: (article: StaffArticle) => void;
}) {
  const coverUrl = resolveMediaUrl(article.cover_image);
  const editStep = inferArticleStep(article);

  return (
    <article className="newsroom-article-card">
      <div className="newsroom-article-card__main">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt=""
            className="newsroom-article-card__cover"
          />
        ) : (
          <div className="newsroom-article-card__cover-fallback">
            {mediaTypeLabel(article.media_type)}
          </div>
        )}

        <div className="newsroom-article-card__body">
          <div className="newsroom-article-card__top">
            {article.category?.name_ar ? (
              <span className="newsroom-article-card__category">
                {article.category.name_ar}
              </span>
            ) : null}
            <StatusBadge status={article.status} />
            <ArticleVerifiedBadge article={article} />
          </div>

          <Link
            to={staffArticlePath(article.id)}
            className="newsroom-article-card__title"
          >
            {article.title}
          </Link>

          <div className="newsroom-article-card__meta">
            <span>{mediaTypeLabel(article.media_type)}</span>
            <span>{article.author.name}</span>
            {article.status === "draft" ? (
              <span className="newsroom-article-card__progress">
                {formatStepProgress(inferArticleStep(article), article.media_type)}
              </span>
            ) : null}
            {article.status === "scheduled" && article.scheduled_for ? (
              <span>
                مجدول: {new Date(article.scheduled_for).toLocaleString("ar")}
              </span>
            ) : null}
            <span>{new Date(article.updated_at).toLocaleDateString("ar")}</span>
          </div>
        </div>
      </div>

      <div className="newsroom-article-card__actions">
        <Button asChild variant="outline" size="sm">
          <Link to={staffArticlePath(article.id)}>
            <Eye className="size-3.5" />
            عرض
          </Link>
        </Button>
        {canReschedule && article.status === "scheduled" ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReschedule(article)}
          >
            <CalendarClock className="size-3.5" />
            إعادة جدولة
          </Button>
        ) : null}
        {canViewTrustIndex ? (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="newsroom-article-card__feedback-btn"
          >
            <Link to={staffArticleTrustFeedbackPath(article.id)}>
              <BarChart3 className="size-3.5" />
              التقييمات
            </Link>
          </Button>
        ) : null}
        {canEdit ? (
          <Button asChild variant="outline" size="sm">
            <Link to={staffArticleEditPath(article.id, editStep)}>
              <PenLine className="size-3.5" />
              تحرير
            </Link>
          </Button>
        ) : null}
        {canDelete ? (
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={`حذف ${article.title}`}
            onClick={() => onDelete(article)}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        ) : null}
      </div>
    </article>
  );
}

export default function NewsroomArticlesPage() {
  const queryClient = useQueryClient();
  const canEdit = usePermission(PERMISSIONS.EDIT_ARTICLES);
  const canDelete = usePermission(PERMISSIONS.DELETE_ARTICLES);
  const canReschedule = usePermission(PERMISSIONS.SCHEDULE_ARTICLES);
  const canViewTrustIndex = usePermission(PERMISSIONS.VIEW_TRUST_INDEX);
  const [params, setParams] = useSearchParams();
  const [deleteTarget, setDeleteTarget] = useState<StaffArticle | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<StaffArticle | null>(
    null,
  );

  const status = params.get("status") ?? "";
  const category = params.get("category") ?? "";
  const mine = params.get("mine") === "1";
  const page = Math.max(1, Number(params.get("page") ?? "1"));

  const { data: categories = [] } = useQuery({
    queryKey: ["public-categories"],
    queryFn: () => PublicCategories_APIs.list(),
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["staff-articles", status, category, mine, page, TABLE_PAGE_SIZE],
    queryFn: () =>
      ArticlesStaff_APIs.list({
        status: status ? (status as ArticleStatus) : undefined,
        category: category ? Number(category) : undefined,
        mine,
        page,
        per_page: TABLE_PAGE_SIZE,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => ArticlesStaff_APIs.deleteArticle(id),
    onSuccess: () => {
      toast.success("تم حذف المقال");
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["staff-articles"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const {
    items: articles,
    total,
    currentPage,
    lastPage,
    pageSize,
  } = paginateList(data?.items ?? [], page, data?.pagination);

  const pageStats = useMemo(() => {
    return {
      published: articles.filter((item) => item.status === "published").length,
      draft: articles.filter((item) => item.status === "draft").length,
      scheduled: articles.filter((item) => item.status === "scheduled").length,
    };
  }, [articles]);

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    setParams(next);
  };

  const setPage = (nextPage: number) => {
    updateParams({ page: nextPage <= 1 ? null : String(nextPage) });
  };

  return (
    <div className="newsroom-articles-page">
      <header className="newsroom-articles-hero">
        <div className="newsroom-articles-hero__intro">
          <p className="newsroom-articles-hero__kicker">غرفة الأخبار</p>
          <h1 className="newsroom-articles-hero__title">مقالاتي</h1>
          <p className="newsroom-articles-hero__lead">
            إدارة المسودات والمقالات المجدولة والمنشورة — تابع التقدم، عدّل،
            وانشر من مكان واحد.
          </p>
          <Button asChild className="newsroom-articles-hero__cta">
            <Link to={ROUTES.NEWSROOM_ARTICLE_NEW}>
              <Plus className="size-4" />
              مقال جديد
            </Link>
          </Button>
        </div>

        <div className="newsroom-articles-hero__stats">
          <div className="newsroom-articles-stat">
            <span className="newsroom-articles-stat__value">{total}</span>
            <span className="newsroom-articles-stat__label">إجمالي المقالات</span>
          </div>
          <div className="newsroom-articles-stat">
            <span className="newsroom-articles-stat__value">
              {pageStats.published}
            </span>
            <span className="newsroom-articles-stat__label">منشور</span>
          </div>
          <div className="newsroom-articles-stat">
            <span className="newsroom-articles-stat__value">
              {pageStats.draft + pageStats.scheduled}
            </span>
            <span className="newsroom-articles-stat__label">
              مسودة / مجدول
            </span>
          </div>
        </div>
      </header>

      <div className="newsroom-articles-toolbar">
        <div className="newsroom-articles-filters">
          <Select
            value={status || "all"}
            onValueChange={(value) =>
              updateParams({ status: value === "all" ? null : value, page: null })
            }
          >
            <SelectTrigger className="newsroom-articles-filter">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <CategoryFlyoutFilter
            categories={categories}
            value={category}
            className="newsroom-articles-filter newsroom-articles-filter--wide"
            onChange={(nextCategory) =>
              updateParams({
                category: nextCategory,
                page: null,
              })
            }
          />

          <label
            className={cn(
              "newsroom-articles-mine",
              mine && "newsroom-articles-mine--active",
            )}
          >
            <Checkbox
              checked={mine}
              onCheckedChange={(checked) =>
                updateParams({
                  mine: checked === true ? "1" : null,
                  page: null,
                })
              }
            />
            <span>مقالاتي فقط</span>
          </label>
        </div>
      </div>

      {isLoading ? (
        <AdminLoadingState variant="table" />
      ) : isError ? (
        <AdminEmptyState
          icon={FileText}
          title="تعذّر تحميل المقالات"
          description={getApiErrorMessage(error)}
        />
      ) : articles.length === 0 ? (
        <AdminEmptyState
          icon={FileText}
          title="لا توجد مقالات مطابقة"
          description="جرّب تغيير الفلاتر أو ابدأ مقالاً جديداً."
          action={
            <Button asChild>
              <Link to={ROUTES.NEWSROOM_ARTICLE_NEW}>
                <Plus className="size-4" />
                مقال جديد
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="newsroom-articles-list">
            {articles.map((article) => (
              <StaffArticleCard
                key={article.id}
                article={article}
                canEdit={canEdit}
                canDelete={canDelete}
                canReschedule={canReschedule}
                canViewTrustIndex={canViewTrustIndex}
                onDelete={setDeleteTarget}
                onReschedule={setRescheduleTarget}
              />
            ))}
          </div>

          <AdminPagination
            currentPage={currentPage}
            lastPage={lastPage}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            label="صفحات المقالات"
          />
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        description={`هل تريد حذف «${deleteTarget?.title}»؟ لا يمكن التراجع عن هذا الإجراء.`}
        isPending={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() =>
          deleteTarget && deleteMutation.mutate(deleteTarget.id)
        }
      />

      <RescheduleArticleDialog
        article={rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
      />
    </div>
  );
}
