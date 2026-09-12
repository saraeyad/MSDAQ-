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
import { ArticleStatusActions } from "@/features/newsroom/articles/ArticleStatusActions";
import { CategoryFlyoutFilter } from "@/features/newsroom/articles/CategoryFlyoutFilter";
import { usePermission } from "@/hooks/auth";
import { usePublicCategories } from "@/hooks/public";
import { useAuth } from "@/context/auth";
import { getApiErrorMessage } from "@/lib/api";
import { mediaTypeLabel, resolveMediaUrl } from "@/lib/media";
import {
  collectCategoryFilterKeys,
  findCategoryByFilterKey,
  formatStepProgress,
  inferArticleStep,
} from "@/lib/publishing";
import { articleReviewThresholds } from "@/lib/site";
import { paginateList, TABLE_PAGE_SIZE } from "@/lib/staff";
import { cn } from "@/lib/utils";
import {
  PERMISSIONS,
  ROUTES,
  staffArticlePath,
  staffArticleTrustFeedbackPath,
} from "@/router/routes";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import type { ArticleStatus, StaffArticle } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Eye,
  FileText,
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
  canPublish,
  canSchedule,
  canRevert,
  canViewTrustIndex,
  onDelete,
  onRevert,
}: {
  article: StaffArticle;
  canEdit: boolean;
  canDelete: boolean;
  canPublish: boolean;
  canSchedule: boolean;
  canRevert: boolean;
  canViewTrustIndex: boolean;
  onDelete: (article: StaffArticle) => void;
  onRevert: (article: StaffArticle) => void;
}) {
  const coverUrl = resolveMediaUrl(article.cover_image);
  const { target: reviewTarget, max: reviewMax } =
    articleReviewThresholds(article);

  return (
    <article className="newsroom-article-card">
      <div className="newsroom-article-card__main">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt=""
            className="newsroom-article-card__cover"
            loading="lazy"
            decoding="async"
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
            {reviewTarget != null || reviewMax != null ? (
              <span className="newsroom-article-card__reviews">
                <span
                  className="newsroom-article-card__review-pill"
                  data-empty={reviewTarget == null ? "true" : "false"}
                >
                  هدف {reviewTarget != null ? reviewTarget.toLocaleString("ar") : "—"}
                </span>
                <span
                  className="newsroom-article-card__review-pill newsroom-article-card__review-pill--max"
                  data-empty={reviewMax == null ? "true" : "false"}
                >
                  حد {reviewMax != null ? reviewMax.toLocaleString("ar") : "—"}
                </span>
              </span>
            ) : null}
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
        <ArticleStatusActions
          article={article}
          canEdit={canEdit}
          canPublish={canPublish}
          canSchedule={canSchedule}
          canRevert={canRevert}
          onRevert={onRevert}
        />
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
  const { user } = useAuth();
  const canEdit = usePermission(PERMISSIONS.EDIT_ARTICLES);
  const canDelete = usePermission(PERMISSIONS.DELETE_ARTICLES);
  const canPublish =
    usePermission(PERMISSIONS.PUBLISH_ARTICLES) || canEdit;
  const canSchedule =
    usePermission(PERMISSIONS.SCHEDULE_ARTICLES) || canEdit;
  const canRevert =
    usePermission(PERMISSIONS.REVERT_ARTICLES) || canEdit;
  const canViewTrustIndex = usePermission(PERMISSIONS.VIEW_TRUST_INDEX);
  const [params, setParams] = useSearchParams();
  const [deleteTarget, setDeleteTarget] = useState<StaffArticle | null>(null);
  const [revertTarget, setRevertTarget] = useState<StaffArticle | null>(null);

  const status = params.get("status") ?? "";
  const category = params.get("category") ?? "";
  const mine = params.get("mine") === "1";
  const page = Math.max(1, Number(params.get("page") ?? "1"));

  const { data: categories = [] } = usePublicCategories();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["staff-articles", status, category, mine],
    queryFn: async () => {
      const numericCategory = Number(category);
      const filters = {
        status: status ? (status as ArticleStatus) : undefined,
        category:
          category &&
          Number.isFinite(numericCategory) &&
          String(numericCategory) === category
            ? numericCategory
            : undefined,
        mine,
        per_page: 100,
      };
      const first = await ArticlesStaff_APIs.list({ ...filters, page: 1 });
      const lastPage = first.pagination?.last_page ?? 1;
      if (lastPage <= 1) return first;

      const rest = await Promise.all(
        Array.from({ length: lastPage - 1 }, (_, index) =>
          ArticlesStaff_APIs.list({ ...filters, page: index + 2 }),
        ),
      );

      return {
        items: [first, ...rest].flatMap((page) => page.items),
      };
    },
  });

  const filteredArticles = useMemo(() => {
    let items = data?.items ?? [];

    if (status) {
      items = items.filter((article) => article.status === status);
    }

    if (mine && user) {
      items = items.filter((article) => article.author.id === user.id);
    }

    if (category) {
      const selected = findCategoryByFilterKey(categories, category);
      const allowed = new Set(
        selected
          ? collectCategoryFilterKeys(selected)
          : [category],
      );
      items = items.filter((article) => {
        const id = article.category?.id;
        const slug = article.category?.slug;
        return (
          (id != null && allowed.has(String(id))) ||
          (slug != null && allowed.has(slug))
        );
      });
    }

    return items;
  }, [categories, category, data?.items, mine, status, user]);

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => ArticlesStaff_APIs.deleteArticle(id),
    onSuccess: () => {
      toast.success("تم حذف المقال");
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["staff-articles"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const revertMutation = useMutation({
    mutationFn: (id: number | string) => ArticlesStaff_APIs.revert(id),
    onSuccess: () => {
      toast.success("تم إخفاء المقال عن الجمهور وإرجاعه إلى مسودة");
      setRevertTarget(null);
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
  } = paginateList(filteredArticles, page);

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
                canPublish={canPublish}
                canSchedule={canSchedule}
                canRevert={canRevert}
                canViewTrustIndex={canViewTrustIndex}
                onDelete={setDeleteTarget}
                onRevert={setRevertTarget}
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

      <ConfirmDialog
        open={!!revertTarget}
        title="إرجاع إلى مسودة"
        description={`سيتم إخفاء «${revertTarget?.title}» عن الجمهور وإرجاعه إلى مسودة. التعديل متاح دون هذا الإجراء.`}
        confirmLabel="إرجاع إلى مسودة"
        isPending={revertMutation.isPending}
        onClose={() => setRevertTarget(null)}
        onConfirm={() => revertTarget && revertMutation.mutate(revertTarget.id)}
      />
    </div>
  );
}
