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
import { AdminFilterBar } from "@/features/admin/components/AdminFilterBar";
import { AdminLoadingState } from "@/features/admin/components/AdminLoadingState";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { AdminPanel } from "@/features/admin/components/AdminPanel";
import { StatusBadge } from "@/features/admin/components/StatusBadge";
import { usePermission } from "@/hooks/usePermission";
import { getApiErrorMessage } from "@/lib/api-data";
import {
  flattenCategoriesForSelect,
  formatCategorySelectLabel,
} from "@/lib/category-tree";
import { mediaTypeLabel } from "@/lib/media-labels";
import { resolveMediaUrl } from "@/lib/media-url";
import { formatStepProgress, inferArticleStep } from "@/lib/publish-gate";
import { PERMISSIONS, ROUTES } from "@/router/routes";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import { PublicCategories_APIs } from "@/services/api/public-categories";
import type { ArticleStatus, StaffArticle } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
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

function StaffArticleRow({
  article,
  canEdit,
  canDelete,
  onDelete,
}: {
  article: StaffArticle;
  canEdit: boolean;
  canDelete: boolean;
  onDelete: (article: StaffArticle) => void;
}) {
  const coverUrl = resolveMediaUrl(article.cover_image);
  const editStep = inferArticleStep(article);

  return (
    <div className="newsroom-article-row">
      {coverUrl ? (
        <img src={coverUrl} alt="" className="newsroom-article-row__cover" />
      ) : (
        <div className="newsroom-article-row__cover-fallback">
          {mediaTypeLabel(article.media_type)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <Link
          to={`/newsroom/articles/${article.id}`}
          className="newsroom-article-row__title"
        >
          {article.title}
        </Link>
        <div className="newsroom-article-row__meta">
          <StatusBadge status={article.status} />
          <span>{mediaTypeLabel(article.media_type)}</span>
          {article.category?.name_ar ? (
            <span>{article.category.name_ar}</span>
          ) : null}
          <span>{article.author.name}</span>
          {article.status === "draft" ? (
            <span>
              {formatStepProgress(inferArticleStep(article), article.media_type)}
            </span>
          ) : null}
          <span>{new Date(article.updated_at).toLocaleDateString("ar")}</span>
        </div>
      </div>

      <div className="newsroom-article-row__actions">
        <Button asChild variant="outline" size="sm">
          <Link to={`/newsroom/articles/${article.id}`}>
            <Eye className="size-3.5" />
            عرض
          </Link>
        </Button>
        {canEdit ? (
          <Button asChild variant="outline" size="sm">
            <Link to={`/newsroom/articles/${article.id}/edit?step=${editStep}`}>
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
    </div>
  );
}

export default function NewsroomArticlesPage() {
  const queryClient = useQueryClient();
  const canEdit = usePermission(PERMISSIONS.EDIT_ARTICLES);
  const canDelete = usePermission(PERMISSIONS.DELETE_ARTICLES);
  const [params, setParams] = useSearchParams();
  const [deleteTarget, setDeleteTarget] = useState<StaffArticle | null>(null);

  const status = params.get("status") ?? "";
  const category = params.get("category") ?? "";
  const mine = params.get("mine") === "1";
  const page = Math.max(1, Number(params.get("page") ?? "1"));

  const { data: categories } = useQuery({
    queryKey: ["public-categories"],
    queryFn: () => PublicCategories_APIs.list(),
  });

  const categoryOptions = useMemo(
    () => flattenCategoriesForSelect(categories ?? []),
    [categories],
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["staff-articles", status, category, mine, page],
    queryFn: () =>
      ArticlesStaff_APIs.list({
        status: status ? (status as ArticleStatus) : undefined,
        category: category ? Number(category) : undefined,
        mine,
        page,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ArticlesStaff_APIs.deleteArticle(id),
    onSuccess: () => {
      toast.success("تم حذف المقال");
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["staff-articles"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const articles = data?.items ?? [];
  const pagination = data?.pagination;

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
    <div className="space-y-6">
      <AdminPageHeader
        title="مقالاتي"
        description="إدارة المسودات والمقالات المجدولة والمنشورة"
        actions={
          <Button asChild>
            <Link to={ROUTES.NEWSROOM_ARTICLE_NEW}>
              <Plus className="size-4" />
              مقال جديد
            </Link>
          </Button>
        }
      />

      <AdminFilterBar>
        <Select
          value={status || "all"}
          onValueChange={(v) =>
            updateParams({ status: v === "all" ? null : v, page: null })
          }
        >
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={category || "all"}
          onValueChange={(v) =>
            updateParams({ category: v === "all" ? null : v, page: null })
          }
        >
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="التصنيف" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل التصنيفات</SelectItem>
            {categoryOptions.map((option) => (
              <SelectItem key={option.id} value={String(option.id)}>
                {formatCategorySelectLabel(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={mine}
            onCheckedChange={(checked) =>
              updateParams({
                mine: checked === true ? "1" : null,
                page: null,
              })
            }
          />
          مقالاتي فقط
        </label>
      </AdminFilterBar>

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
        <AdminPanel
          title="المقالات"
          badge={pagination?.total ?? articles.length}
          flush
          footer={
            pagination && pagination.last_page > 1 ? (
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronRight className="size-4" />
                  السابق
                </Button>
                <span className="text-sm text-muted-foreground">
                  صفحة {pagination.current_page} من {pagination.last_page}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.last_page}
                  onClick={() => setPage(page + 1)}
                >
                  التالي
                  <ChevronLeft className="size-4" />
                </Button>
              </div>
            ) : undefined
          }
        >
          {articles.map((article) => (
            <StaffArticleRow
              key={article.id}
              article={article}
              canEdit={canEdit}
              canDelete={canDelete}
              onDelete={setDeleteTarget}
            />
          ))}
        </AdminPanel>
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
    </div>
  );
}
