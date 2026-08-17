import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileInput } from "@/components/ui/file-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePermission } from "@/hooks/usePermission";
import { AdminEmptyState } from "@/features/admin/components/AdminEmptyState";
import { AdminFilterBar } from "@/features/admin/components/AdminFilterBar";
import { AdminLoadingState } from "@/features/admin/components/AdminLoadingState";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { AdminPagination } from "@/features/admin/components/AdminPagination";
import { AdminPanel } from "@/features/admin/components/AdminPanel";
import { getApiErrorMessage } from "@/lib/api-data";
import { paginateList } from "@/lib/table-pagination";
import { LibraryFileGlyph } from "@/features/newsroom/library/LibraryFileGlyph";
import { LibraryItemCard } from "@/features/newsroom/library/LibraryItemCard";
import { DeleteLibraryItemDialog } from "@/features/newsroom/library/DeleteLibraryItemDialog";
import {
  FileUploadProgressCard,
  type FileUploadProgressStatus,
} from "@/features/newsroom/library/FileUploadProgressCard";
import { downloadLibraryItem } from "@/lib/library-download";
import { Library_APIs } from "@/services/api/library";
import { PERMISSIONS } from "@/router/routes";
import { LIBRARY_PAGE_SIZE, type LibraryItem } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileUp, FolderOpen, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_FILE_SIZE_ERROR = "حجم الملف يجب ألا يتجاوز 50 ميغابايت";

type UploadProgressState = {
  status: FileUploadProgressStatus;
  progress: number;
  error?: string;
};

function uploadPercentFromEvent(loaded: number, total?: number): number {
  if (!total) return 0;
  return Math.min(99, Math.round((loaded * 100) / total));
}

function assertLibraryFileSize(file: File) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(MAX_FILE_SIZE_ERROR);
  }
}

function libraryMultipartFormData(
  title: string,
  description: string,
  file: File,
) {
  const formData = new FormData();
  formData.append("title", title.trim());
  if (description.trim()) {
    formData.append("description", description.trim());
  }
  formData.append("file", file);
  return formData;
}

export default function LibraryPage() {
  const canUpload = usePermission(PERMISSIONS.UPLOAD_LIBRARY);
  const canEdit = usePermission(PERMISSIONS.EDIT_LIBRARY);
  const canDelete = usePermission(PERMISSIONS.DELETE_LIBRARY);
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressState | null>(
    null,
  );

  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<LibraryItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editReplaceFile, setEditReplaceFile] = useState<File | null>(null);
  const [editUploadProgress, setEditUploadProgress] =
    useState<UploadProgressState | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const listQuery = useQuery({
    queryKey: ["library", search, page],
    queryFn: () =>
      Library_APIs.list({
        page,
        search: search || undefined,
      }),
  });

  const {
    items,
    total,
    currentPage,
    lastPage,
    pageSize,
  } = paginateList(
    listQuery.data?.items ?? [],
    page,
    listQuery.data?.pagination,
    LIBRARY_PAGE_SIZE,
  );

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["library"] });
  };

  const resetUploadForm = () => {
    setShowUpload(false);
    setUploadTitle("");
    setUploadDescription("");
    setUploadFile(null);
    setUploadProgress(null);
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!uploadFile) throw new Error("اختر ملفاً");
      assertLibraryFileSize(uploadFile);
      const formData = libraryMultipartFormData(
        uploadTitle,
        uploadDescription,
        uploadFile,
      );
      setUploadProgress({ status: "uploading", progress: 0 });
      return Library_APIs.upload(formData, {
        onUploadProgress: (event) => {
          setUploadProgress({
            status: "uploading",
            progress: uploadPercentFromEvent(event.loaded, event.total),
          });
        },
      });
    },
    onSuccess: () => {
      setUploadProgress({ status: "complete", progress: 100 });
      toast.success("تم رفع الملف");
      invalidate();
      window.setTimeout(resetUploadForm, 900);
    },
    onError: (err) => {
      const message = getApiErrorMessage(err);
      setUploadProgress({ status: "failed", progress: 0, error: message });
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingItem) throw new Error("no item");

      if (editReplaceFile) {
        assertLibraryFileSize(editReplaceFile);
        const formData = libraryMultipartFormData(
          editTitle,
          editDescription,
          editReplaceFile,
        );
        setEditUploadProgress({ status: "uploading", progress: 0 });
        return Library_APIs.updateWithFile(editingItem.id, formData, {
          onUploadProgress: (event) => {
            setEditUploadProgress({
              status: "uploading",
              progress: uploadPercentFromEvent(event.loaded, event.total),
            });
          },
        });
      }

      return Library_APIs.update(editingItem.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      });
    },
    onSuccess: () => {
      if (editReplaceFile) {
        setEditUploadProgress({ status: "complete", progress: 100 });
        toast.success("تم تحديث الملف");
        invalidate();
        window.setTimeout(closeEditDialog, 900);
        return;
      }
      toast.success("تم تحديث الملف");
      closeEditDialog();
      invalidate();
    },
    onError: (err) => {
      const message = getApiErrorMessage(err);
      if (editReplaceFile) {
        setEditUploadProgress({
          status: "failed",
          progress: 0,
          error: message,
        });
      }
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => Library_APIs.delete(id),
    onSuccess: () => {
      toast.success("تم الحذف");
      setItemToDelete(null);
      invalidate();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const closeEditDialog = () => {
    setEditingItem(null);
    setEditReplaceFile(null);
    setEditUploadProgress(null);
  };

  const openEdit = (item: LibraryItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditDescription(item.description ?? "");
    setEditReplaceFile(null);
    setEditUploadProgress(null);
  };

  const handleUploadFileChange = (file: File | null) => {
    setUploadFile(file);
    setUploadProgress(null);
  };

  const handleEditReplaceFileChange = (file: File | null) => {
    setEditReplaceFile(file);
    setEditUploadProgress(null);
  };

  const handleDownload = async (item: LibraryItem) => {
    setDownloadingId(item.id);
    try {
      await downloadLibraryItem(item);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDownloadingId(null);
    }
  };

  const applySearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  return (
    <div className="library-page space-y-6">
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
      />

      {showUpload && canUpload ? (
        <AdminPanel
          title="رفع ملف جديد"
          description="حتى 50 ميغابايت — سيظهر الملف للفريق حسب الصلاحيات"
          icon={FileUp}
          accent="primary"
          footer={
            <div className="flex gap-2">
              <Button
                onClick={() => uploadMutation.mutate()}
                disabled={
                  !uploadTitle.trim() ||
                  !uploadFile ||
                  uploadMutation.isPending ||
                  uploadProgress?.status === "complete"
                }
              >
                {uploadMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                رفع
              </Button>
              <Button
                variant="outline"
                disabled={uploadMutation.isPending}
                onClick={resetUploadForm}
              >
                إلغاء
              </Button>
            </div>
          }
        >
          <div className="library-form">
            <div className="library-form__field">
              <Label>العنوان</Label>
              <Input
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="اسم واضح للملف"
                disabled={uploadMutation.isPending}
              />
            </div>
            <div className="library-form__wide library-form__field">
              <Label>الوصف (اختياري)</Label>
              <Textarea
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="ماذا يحتوي هذا الملف؟"
                rows={2}
                disabled={uploadMutation.isPending}
              />
            </div>
            <div className="library-form__wide library-form__field">
              <Label>الملف (حتى 50 ميغابايت)</Label>
              {uploadFile && uploadProgress ? (
                <FileUploadProgressCard
                  file={uploadFile}
                  status={uploadProgress.status}
                  progress={uploadProgress.progress}
                  errorMessage={uploadProgress.error}
                  onRemove={() => {
                    if (uploadMutation.isPending) return;
                    handleUploadFileChange(null);
                  }}
                  onRetry={() => uploadMutation.mutate()}
                />
              ) : (
                <FileInput
                  value={uploadFile}
                  onChange={handleUploadFileChange}
                  chooseLabel="اختر ملفاً"
                  emptyLabel="لم يُختَر ملف بعد"
                  disabled={uploadMutation.isPending}
                />
              )}
            </div>
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
          description="جرّب تغيير البحث."
        />
      ) : (
        <AdminPanel
          title="الملفات"
          badge={total}
          footer={
            <AdminPagination
              currentPage={currentPage}
              lastPage={lastPage}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
              label="صفحات المكتبة"
            />
          }
        >
          <div className="library-grid">
            {items.map((item) => (
              <LibraryItemCard
                key={item.id}
                item={item}
                canEdit={canEdit}
                canDelete={canDelete}
                onEdit={openEdit}
                onDelete={setItemToDelete}
                onDownload={handleDownload}
                isDeleting={
                  deleteMutation.isPending && itemToDelete?.id === item.id
                }
                isDownloading={downloadingId === item.id}
              />
            ))}
          </div>
        </AdminPanel>
      )}

      <Dialog
        open={!!editingItem}
        onOpenChange={(open) => !open && closeEditDialog()}
      >
        <DialogContent className="library-dialog">
          <DialogHeader>
            <DialogTitle>تعديل الملف</DialogTitle>
          </DialogHeader>
          <div className="library-form">
            <div className="library-form__wide library-form__field">
              <Label>العنوان</Label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                disabled={updateMutation.isPending}
              />
            </div>
            <div className="library-form__wide library-form__field">
              <Label>الوصف</Label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                disabled={updateMutation.isPending}
              />
            </div>
            {editingItem?.file?.name ? (
              <div className="library-form__wide library-form__field">
                <Label>الملف الحالي</Label>
                <div className="library-current-file">
                  <LibraryFileGlyph
                    fileName={editingItem.file.name}
                    mimeType={editingItem.file.mime_type}
                  />
                  <div className="library-current-file__copy">
                    <p
                      className="library-current-file__name"
                      dir="ltr"
                      title={editingItem.file.name}
                    >
                      {editingItem.file.name}
                    </p>
                    <p className="library-current-file__meta">
                      {editingItem.file.size}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
            <div className="library-form__wide library-form__field">
              <Label>استبدال الملف (اختياري)</Label>
              {editReplaceFile && editUploadProgress ? (
                <FileUploadProgressCard
                  file={editReplaceFile}
                  status={editUploadProgress.status}
                  progress={editUploadProgress.progress}
                  errorMessage={editUploadProgress.error}
                  onRemove={() => {
                    if (updateMutation.isPending) return;
                    handleEditReplaceFileChange(null);
                  }}
                  onRetry={() => updateMutation.mutate()}
                />
              ) : (
                <FileInput
                  value={editReplaceFile}
                  onChange={handleEditReplaceFileChange}
                  chooseLabel="اختر ملفاً جديداً"
                  emptyLabel="بدون استبدال — يُحفظ الملف الحالي"
                  disabled={updateMutation.isPending}
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog}>
              إلغاء
            </Button>
            <Button
              onClick={() => updateMutation.mutate()}
              disabled={
                !editTitle.trim() ||
                updateMutation.isPending ||
                editUploadProgress?.status === "complete"
              }
            >
              {updateMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteLibraryItemDialog
        item={itemToDelete}
        isPending={deleteMutation.isPending}
        onClose={() => {
          if (!deleteMutation.isPending) setItemToDelete(null);
        }}
        onConfirm={(id) => deleteMutation.mutate(id)}
      />
    </div>
  );
}
