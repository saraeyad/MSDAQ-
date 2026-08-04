import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePermission } from "@/hooks/usePermission";
import { getApiErrorMessage } from "@/lib/api-data";
import {
  articleStatusLabel,
  mediaTypeLabel,
} from "@/lib/media-labels";
import { resolveMediaUrl } from "@/lib/media-url";
import { inferArticleStep, formatStepProgress } from "@/lib/publish-gate";
import { PERMISSIONS } from "@/router/routes";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import { PublicCategories_APIs } from "@/services/api/public-categories";
import { PageLoading } from "@/components/loading-spinner";
import type { ArticleStatus, StaffArticle } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  PenLine,
  Trash2,
} from "lucide-react";
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
  isDeleting,
}: {
  article: StaffArticle;
  canEdit: boolean;
  canDelete: boolean;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}) {
  const coverUrl = resolveMediaUrl(article.cover_image);
  const editStep = inferArticleStep(article);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
      {coverUrl ? (
        <img
          src={coverUrl}
          alt=""
          className="size-16 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
          {mediaTypeLabel(article.media_type)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <Link
          to={`/newsroom/articles/${article.id}`}
          className="font-medium hover:text-primary"
        >
          {article.title}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-md bg-accent px-2 py-0.5">
            {articleStatusLabel(article.status)}
          </span>
          <span>{mediaTypeLabel(article.media_type)}</span>
          <span>{article.category?.name_ar}</span>
          <span>{article.author.name}</span>
          {article.status === "draft" && (
            <span>{formatStepProgress(inferArticleStep(article), article.media_type)}</span>
          )}
          <span>
            {new Date(article.updated_at).toLocaleDateString("ar")}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to={`/newsroom/articles/${article.id}`}>
            <Eye className="size-4" />
            عرض
          </Link>
        </Button>
        {canEdit && (
          <Button asChild variant="outline" size="sm">
            <Link
              to={`/newsroom/articles/${article.id}/edit?step=${editStep}`}
            >
              <PenLine className="size-4" />
              تحرير
            </Link>
          </Button>
        )}
        {canDelete && (
          <Button
            variant="outline"
            size="sm"
            disabled={isDeleting}
            onClick={() => onDelete(article.id)}
            className="text-destructive hover:text-destructive"
          >
            {isDeleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            حذف
          </Button>
        )}
      </div>
    </div>
  );
}

export default function NewsroomArticlesPage() {
  const queryClient = useQueryClient();
  const canEdit = usePermission(PERMISSIONS.EDIT_ARTICLES);
  const canDelete = usePermission(PERMISSIONS.DELETE_ARTICLES);
  const [params, setParams] = useSearchParams();

  const status = params.get("status") ?? "";
  const category = params.get("category") ?? "";
  const mine = params.get("mine") !== "0";
  const page = Math.max(1, Number(params.get("page") ?? "1"));

  const { data: categories } = useQuery({
    queryKey: ["public-categories"],
    queryFn: () => PublicCategories_APIs.list(),
  });

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
      void queryClient.invalidateQueries({ queryKey: ["staff-articles"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const handleDelete = (id: number) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المقال؟")) return;
    deleteMutation.mutate(id);
  };

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
      <div>
        <h2 className="section-title">مقالاتي</h2>
        <p className="section-description">
          إدارة المسودات والمقالات المجدولة والمنشورة
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:flex-row md:flex-wrap md:items-center">
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
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {cat.name_ar}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={mine}
            onChange={(e) =>
              updateParams({
                mine: e.target.checked ? null : "0",
                page: null,
              })
            }
            className="size-4 rounded border-border"
          />
          مقالاتي فقط
        </label>

        {pagination && (
          <span className="text-sm text-muted-foreground md:ms-auto">
            {pagination.total} مقال
          </span>
        )}
      </div>

      {isLoading ? (
        <PageLoading />
      ) : isError ? (
        <p className="text-destructive">{getApiErrorMessage(error)}</p>
      ) : articles.length === 0 ? (
        <p className="text-muted-foreground">لا توجد مقالات مطابقة.</p>
      ) : (
        <>
          <div className="space-y-3">
            {articles.map((article) => (
              <StaffArticleRow
                key={article.id}
                article={article}
                canEdit={canEdit}
                canDelete={canDelete}
                onDelete={handleDelete}
                isDeleting={
                  deleteMutation.isPending &&
                  deleteMutation.variables === article.id
                }
              />
            ))}
          </div>

          {pagination && pagination.last_page > 1 && (
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
          )}
        </>
      )}
    </div>
  );
}
