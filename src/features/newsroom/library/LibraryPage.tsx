import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePermission } from "@/hooks/usePermission";
import { AdminEmptyState } from "@/features/admin/components/AdminEmptyState";
import { AdminFilterBar } from "@/features/admin/components/AdminFilterBar";
import { AdminLoadingState } from "@/features/admin/components/AdminLoadingState";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { AdminPanel } from "@/features/admin/components/AdminPanel";
import { getApiErrorMessage } from "@/lib/api-data";
import { downloadLibraryItem } from "@/lib/library-download";
import {
  LIBRARY_FILE_TYPE_OPTIONS,
  libraryFileTypeLabel,
} from "@/lib/library-labels";
import { Library_APIs } from "@/services/api/library";
import { PERMISSIONS } from "@/router/routes";
import type { LibraryFileType, LibraryItem } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileUp,
  FolderOpen,
  Loader2,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const CATEGORY_PRESETS = ["reports", "guides", "images", "policies", "templates"];

function LibraryItemCard({
  item,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onDownload,
  isDeleting,
  isDownloading,
}: {
  item: LibraryItem;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (item: LibraryItem) => void;
  onDelete: (item: LibraryItem) => void;
  onDownload: (item: LibraryItem) => void;
  isDeleting: boolean;
  isDownloading: boolean;
}) {
  return (
    <div className="content-card flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium">{item.title}</p>
          {item.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {item.description}
            </p>
          )}
        </div>
        <span className="shrink-0 rounded-md bg-accent px-2 py-0.5 text-[10px]">
          {libraryFileTypeLabel(item.file_type)}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {item.category && <span>{item.category}</span>}
        {item.uploaded_by && <span>· {item.uploaded_by.name}</span>}
        <span>
          · {new Date(item.created_at).toLocaleDateString("ar")}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isDownloading}
          onClick={() => onDownload(item)}
        >
          {isDownloading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          تحميل
        </Button>
        {canEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
            <Pencil className="size-4" />
            تعديل
          </Button>
        )}
        {canDelete && (
          <Button
            variant="outline"
            size="sm"
            disabled={isDeleting}
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(item)}
          >
            <Trash2 className="size-4" />
            حذف
          </Button>
        )}
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const canUpload = usePermission(PERMISSIONS.UPLOAD_LIBRARY);
  const canEdit = usePermission(PERMISSIONS.EDIT_LIBRARY);
  const canDelete = usePermission(PERMISSIONS.DELETE_LIBRARY);
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterFileType, setFilterFileType] = useState<LibraryFileType | "all">(
    "all",
  );

  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadCategory, setUploadCategory] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const listQuery = useQuery({
    queryKey: ["library", filterCategory, filterFileType, search, page],
    queryFn: () =>
      Library_APIs.list({
        page,
        search: search || undefined,
        category: filterCategory || undefined,
        file_type: filterFileType === "all" ? undefined : filterFileType,
      }),
  });

  const items = listQuery.data?.items ?? [];
  const pagination = listQuery.data?.pagination;

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["library"] });
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!uploadFile) throw new Error("اختر ملفاً");
      if (uploadFile.size > MAX_FILE_SIZE) {
        throw new Error("حجم الملف يجب ألا يتجاوز 50 ميغابايت");
      }
      const formData = new FormData();
      formData.append("title", uploadTitle.trim());
      if (uploadDescription.trim()) {
        formData.append("description", uploadDescription.trim());
      }
      if (uploadCategory.trim()) {
        formData.append("category", uploadCategory.trim());
      }
      formData.append("file", uploadFile);
      return Library_APIs.upload(formData);
    },
    onSuccess: () => {
      toast.success("تم رفع الملف");
      setShowUpload(false);
      setUploadTitle("");
      setUploadDescription("");
      setUploadCategory("");
      setUploadFile(null);
      invalidate();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editingItem) throw new Error("no item");
      return Library_APIs.update(editingItem.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        category: editCategory.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success("تم تحديث الملف");
      setEditingItem(null);
      invalidate();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => Library_APIs.delete(id),
    onSuccess: () => {
      toast.success("تم الحذف");
      invalidate();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const openEdit = (item: LibraryItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditDescription(item.description ?? "");
    setEditCategory(item.category ?? "");
  };

  const handleDownload = async (item: LibraryItem) => {
    setDownloadingId(item.id);
    try {
      await downloadLibraryItem(item.id, item.title, item.file_type);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = (item: LibraryItem) => {
    if (!window.confirm(`حذف "${item.title}"؟`)) return;
    deleteMutation.mutate(item.id);
  };

  const applySearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="المكتبة"
        description="مستندات وملفات مشتركة — تصفح، حمّل، وارفع حسب صلاحياتك"
        actions={
          canUpload ? (
            <Button
              className="gap-2"
              onClick={() => setShowUpload((open) => !open)}
            >
              <FileUp className="size-4" />
              رفع ملف
            </Button>
          ) : undefined
        }
      />

      <AdminFilterBar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={applySearch}
        searchPlaceholder="بحث في العنوان أو الوصف..."
      >
        <Input
          placeholder="تصنيف"
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setPage(1);
          }}
          className="w-40"
        />
        <Select
          value={filterFileType}
          onValueChange={(value) => {
            setFilterFileType(value as LibraryFileType | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LIBRARY_FILE_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AdminFilterBar>

      {showUpload && canUpload ? (
        <AdminPanel
          title="رفع ملف جديد"
          icon={FileUp}
          footer={
            <div className="flex gap-2">
              <Button
                onClick={() => uploadMutation.mutate()}
                disabled={
                  !uploadTitle.trim() || !uploadFile || uploadMutation.isPending
                }
              >
                {uploadMutation.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                رفع
              </Button>
              <Button variant="outline" onClick={() => setShowUpload(false)}>
                إلغاء
              </Button>
            </div>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>العنوان</Label>
              <Input
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>التصنيف (اختياري)</Label>
              <Input
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                list="library-category-presets"
                placeholder="reports"
              />
              <datalist id="library-category-presets">
                {CATEGORY_PRESETS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>
          <div className="space-y-2">
            <Label>الوصف (اختياري)</Label>
            <Textarea
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>الملف (حتى 50 ميغابايت)</Label>
            <Input
              type="file"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </AdminPanel>
      ) : null}

      {listQuery.isError ? (
        <AdminPanel accent="warning">
          <p className="text-sm text-destructive">
            {getApiErrorMessage(listQuery.error)}
          </p>
        </AdminPanel>
      ) : null}

      {listQuery.isLoading ? (
        <AdminLoadingState variant="table" />
      ) : items.length === 0 ? (
        <AdminEmptyState
          icon={FolderOpen}
          title="لا توجد ملفات مطابقة"
          description="جرّب تغيير البحث أو الفلاتر."
        />
      ) : (
        <AdminPanel
          title="الملفات"
          badge={pagination?.total ?? items.length}
          footer={
            pagination && pagination.last_page > 1 ? (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page} / {pagination.last_page}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.last_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
              </div>
            ) : undefined
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <LibraryItemCard
                key={item.id}
                item={item}
                canEdit={canEdit}
                canDelete={canDelete}
                onEdit={openEdit}
                onDelete={handleDelete}
                onDownload={handleDownload}
                isDeleting={deleteMutation.isPending}
                isDownloading={downloadingId === item.id}
              />
            ))}
          </div>
        </AdminPanel>
      )}

      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setEditingItem(null)}
        >
          <div
            className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">تعديل الملف</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingItem(null)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <Label>العنوان</Label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>الوصف</Label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>التصنيف</Label>
              <Input
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => updateMutation.mutate()}
                disabled={!editTitle.trim() || updateMutation.isPending}
              >
                {updateMutation.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                حفظ
              </Button>
              <Button variant="outline" onClick={() => setEditingItem(null)}>
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
