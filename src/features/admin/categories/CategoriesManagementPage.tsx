import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePermission } from "@/hooks/usePermission";
import { AdminEmptyState } from "@/features/admin/components/AdminEmptyState";
import { AdminLoadingState } from "@/features/admin/components/AdminLoadingState";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { AdminPanel } from "@/features/admin/components/AdminPanel";
import { getApiErrorMessage } from "@/lib/api-data";
import { cn } from "@/lib/utils";
import { PERMISSIONS } from "@/router/routes";
import { Categories_APIs } from "@/services/api/categories";
import type { Category } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import { Fragment, useState } from "react";
import { toast } from "sonner";

function invalidateCategoryQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  void queryClient.invalidateQueries({ queryKey: ["staff-categories"] });
  void queryClient.invalidateQueries({ queryKey: ["public-categories"] });
}

interface EditDraft {
  name_ar: string;
  name_en: string;
  sort_order: number;
  is_active: boolean;
}

function categoryToDraft(category: Category): EditDraft {
  return {
    name_ar: category.name_ar,
    name_en: category.name_en,
    sort_order: category.sort_order,
    is_active: category.is_active,
  };
}

export default function CategoriesManagementPage() {
  const queryClient = useQueryClient();
  const canManage = usePermission(PERMISSIONS.MANAGE_CATEGORIES);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);

  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  const {
    data: categories = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["staff-categories"],
    queryFn: () => Categories_APIs.list(),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      Categories_APIs.create({
        name_ar: nameAr,
        name_en: nameEn,
        sort_order: Number(sortOrder) || 0,
        is_active: isActive,
      }),
    onSuccess: () => {
      toast.success("تم إنشاء التصنيف");
      invalidateCategoryQueries(queryClient);
      setNameAr("");
      setNameEn("");
      setSortOrder("0");
      setIsActive(true);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: EditDraft }) =>
      Categories_APIs.update(id, {
        name_ar: data.name_ar,
        name_en: data.name_en,
        sort_order: data.sort_order,
        is_active: data.is_active,
      }),
    onSuccess: () => {
      toast.success("تم تحديث التصنيف");
      invalidateCategoryQueries(queryClient);
      setEditingId(null);
      setEditDraft(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => Categories_APIs.delete(id),
    onSuccess: () => {
      toast.success("تم حذف التصنيف");
      invalidateCategoryQueries(queryClient);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const handleDelete = (id: number) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا التصنيف؟")) return;
    deleteMutation.mutate(id);
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditDraft(categoryToDraft(category));
  };

  if (isLoading) {
    return <AdminLoadingState variant="table" />;
  }

  if (isError) {
    return (
      <AdminEmptyState
        icon={FolderTree}
        title="تعذّر تحميل التصنيفات"
        description={getApiErrorMessage(error)}
      />
    );
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="التصنيفات"
        description="أقسام المحتوى (مقالات، قصص، بودكاست…)"
      />

      {canManage ? (
        <AdminPanel
          title="تصنيف جديد"
          icon={Plus}
          footer={
            <Button
              onClick={() => createMutation.mutate()}
              disabled={
                createMutation.isPending || !nameAr.trim() || !nameEn.trim()
              }
            >
              {createMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              إنشاء التصنيف
            </Button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>الاسم بالعربية</Label>
              <Input
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم بالإنجليزية</Label>
              <Input
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>ترتيب العرض</Label>
              <Input
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 self-end pb-2 text-sm">
              <Checkbox
                checked={isActive}
                onCheckedChange={(v) => setIsActive(v === true)}
              />
              نشط (يظهر للجمهور)
            </label>
          </div>
        </AdminPanel>
      ) : null}

      <AdminPanel title="قائمة التصنيفات" badge={categories.length}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الترتيب</TableHead>
              <TableHead>العربية</TableHead>
              <TableHead className="admin-table-ltr">الإنجليزية</TableHead>
              <TableHead>نشط</TableHead>
              {canManage ? <TableHead>إجراءات</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canManage ? 5 : 4}
                  className="py-8 text-center text-muted-foreground"
                >
                  لا توجد تصنيفات.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <Fragment key={category.id}>
                  <TableRow>
                    <TableCell>{category.sort_order}</TableCell>
                    <TableCell>{category.name_ar}</TableCell>
                    <TableCell className="admin-table-ltr">
                      {category.name_en}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-xs",
                          category.is_active
                            ? "bg-success/15 text-success"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {category.is_active ? "نعم" : "لا"}
                      </span>
                    </TableCell>
                    {canManage ? (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(category)}
                          >
                            <Pencil className="size-4" />
                            تعديل
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(category.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    ) : null}
                  </TableRow>
                  {canManage && editingId === category.id && editDraft ? (
                    <TableRow>
                      <TableCell colSpan={5} className="bg-muted/20">
                        <div className="space-y-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label>الاسم بالعربية</Label>
                              <Input
                                value={editDraft.name_ar}
                                onChange={(e) =>
                                  setEditDraft({
                                    ...editDraft,
                                    name_ar: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>الاسم بالإنجليزية</Label>
                              <Input
                                value={editDraft.name_en}
                                onChange={(e) =>
                                  setEditDraft({
                                    ...editDraft,
                                    name_en: e.target.value,
                                  })
                                }
                                dir="ltr"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>ترتيب العرض</Label>
                              <Input
                                type="number"
                                min={0}
                                value={editDraft.sort_order}
                                onChange={(e) =>
                                  setEditDraft({
                                    ...editDraft,
                                    sort_order: Number(e.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <label className="flex items-center gap-2 self-end pb-2 text-sm">
                              <Checkbox
                                checked={editDraft.is_active}
                                onCheckedChange={(v) =>
                                  setEditDraft({
                                    ...editDraft,
                                    is_active: v === true,
                                  })
                                }
                              />
                              نشط
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                updateMutation.mutate({
                                  id: category.id,
                                  data: editDraft,
                                })
                              }
                              disabled={updateMutation.isPending}
                            >
                              {updateMutation.isPending && (
                                <Loader2 className="size-4 animate-spin" />
                              )}
                              حفظ
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingId(null);
                                setEditDraft(null);
                              }}
                            >
                              إلغاء
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </AdminPanel>
    </div>
  );
}
