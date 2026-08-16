import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { AdminEmptyState } from "@/features/admin/components/AdminEmptyState";
import { AdminLoadingState } from "@/features/admin/components/AdminLoadingState";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { AdminPagination } from "@/features/admin/components/AdminPagination";
import { AdminPanel } from "@/features/admin/components/AdminPanel";
import { usePermission } from "@/hooks/usePermission";
import { getApiErrorMessage } from "@/lib/api-data";
import { paginateList } from "@/lib/table-pagination";
import { countCategories, flattenCategoryRows } from "@/lib/category-tree";
import { cn } from "@/lib/utils";
import { PERMISSIONS } from "@/router/routes";
import { Categories_APIs } from "@/services/api/categories";
import type { Category } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Folder,
  FolderPlus,
  FolderTree,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Fragment, useMemo, useState } from "react";
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
  description: string;
  sort_order: number;
  is_active: boolean;
  parent_id: number | null;
  isChild: boolean;
}

function categoryToDraft(category: Category, isChild: boolean): EditDraft {
  return {
    name_ar: category.name_ar,
    name_en: category.name_en,
    description: category.description ?? "",
    sort_order: category.sort_order,
    is_active: category.is_active,
    parent_id: category.parent_id,
    isChild,
  };
}

function emptyCreateForm() {
  return {
    nameAr: "",
    nameEn: "",
    description: "",
    sortOrder: "0",
    isActive: true,
  };
}

export default function CategoriesManagementPage() {
  const queryClient = useQueryClient();
  const canManage = usePermission(PERMISSIONS.MANAGE_CATEGORIES);

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [subcategoryParentId, setSubcategoryParentId] = useState<number | null>(
    null,
  );
  const [subCreateForm, setSubCreateForm] = useState(emptyCreateForm);
  const [deleteTarget, setDeleteTarget] = useState<{
    category: Category;
    isChild: boolean;
  } | null>(null);
  const [page, setPage] = useState(1);

  const {
    data: categories = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["staff-categories"],
    queryFn: () => Categories_APIs.list({ all: true }),
  });

  const tableRows = useMemo(
    () => flattenCategoryRows(categories),
    [categories],
  );
  const totalCount = useMemo(() => countCategories(categories), [categories]);
  const {
    items: pagedRows,
    currentPage,
    lastPage,
    pageSize,
  } = paginateList(tableRows, page);
  const topLevelCategories = categories;

  const createMutation = useMutation({
    mutationFn: (payload: {
      name_ar: string;
      name_en: string;
      description: string;
      sort_order: number;
      is_active: boolean;
      parent_id?: number;
    }) => Categories_APIs.create(payload),
    onSuccess: (_, variables) => {
      toast.success(
        variables.parent_id ? "تم إنشاء التصنيف الفرعي" : "تم إنشاء التصنيف",
      );
      invalidateCategoryQueries(queryClient);
      if (variables.parent_id) {
        setSubCreateForm(emptyCreateForm());
        setSubcategoryParentId(null);
      } else {
        setCreateForm(emptyCreateForm());
        setShowCreate(false);
      }
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: EditDraft }) =>
      Categories_APIs.update(id, {
        name_ar: data.name_ar,
        name_en: data.name_en,
        description: data.description.trim() || null,
        sort_order: data.sort_order,
        is_active: data.is_active,
        ...(data.isChild ? { parent_id: data.parent_id } : {}),
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
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const startEdit = (category: Category, isChild: boolean) => {
    setEditingId(category.id);
    setEditDraft(categoryToDraft(category, isChild));
    setSubcategoryParentId(null);
    setShowCreate(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const submitCreate = (parentId?: number) => {
    const form = parentId ? subCreateForm : createForm;
    createMutation.mutate({
      name_ar: form.nameAr,
      name_en: form.nameEn,
      description: form.description.trim() || "",
      sort_order: Number(form.sortOrder) || 0,
      is_active: form.isActive,
      ...(parentId ? { parent_id: parentId } : {}),
    });
  };

  const subcategoryParent = subcategoryParentId
    ? categories.find((category) => category.id === subcategoryParentId)
    : null;

  const columnCount = canManage ? 7 : 6;

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
    <div className="space-y-6">
      <AdminPageHeader
        title="التصنيفات"
        description="أقسام المحتوى وتصنيفاتها الفرعية (مستويان فقط)"
        actions={
          canManage ? (
            <Button
              onClick={() => {
                setShowCreate((open) => !open);
                setSubcategoryParentId(null);
                cancelEdit();
              }}
            >
              {!showCreate ? <Plus className="size-4" /> : null}
              {showCreate ? "إخفاء النموذج" : "تصنيف جديد"}
            </Button>
          ) : null
        }
      />

      {canManage && showCreate ? (
        <AdminPanel
          title="تصنيف رئيسي جديد"
          icon={FolderPlus}
          accent="primary"
          footer={
            <div className="flex gap-2">
              <Button
                onClick={() => submitCreate()}
                disabled={
                  createMutation.isPending ||
                  !createForm.nameAr.trim() ||
                  !createForm.nameEn.trim()
                }
              >
                {createMutation.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                إنشاء التصنيف
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreate(false);
                  setCreateForm(emptyCreateForm());
                }}
              >
                إلغاء
              </Button>
            </div>
          }
        >
          <CategoryFormFields
            values={createForm}
            onChange={setCreateForm}
            idPrefix="create"
          />
        </AdminPanel>
      ) : null}

      {canManage && subcategoryParent ? (
        <AdminPanel
          title={`تصنيف فرعي تحت «${subcategoryParent.name_ar}»`}
          description="سيظهر هذا التصنيف متفرعاً من التصنيف الرئيسي في القائمة والموقع."
          icon={FolderPlus}
          accent="primary"
          footer={
            <div className="flex gap-2">
              <Button
                onClick={() => submitCreate(subcategoryParent.id)}
                disabled={
                  createMutation.isPending ||
                  !subCreateForm.nameAr.trim() ||
                  !subCreateForm.nameEn.trim()
                }
              >
                {createMutation.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                إنشاء التصنيف الفرعي
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSubcategoryParentId(null);
                  setSubCreateForm(emptyCreateForm());
                }}
              >
                إلغاء
              </Button>
            </div>
          }
        >
          <CategoryFormFields
            values={subCreateForm}
            onChange={setSubCreateForm}
            idPrefix="sub-create"
          />
        </AdminPanel>
      ) : null}

      {tableRows.length === 0 ? (
        <AdminEmptyState
          icon={FolderTree}
          title="لا توجد تصنيفات بعد"
          description="أنشئ تصنيفاً رئيسياً لبدء تنظيم أقسام المحتوى."
          action={
            canManage ? (
              <Button onClick={() => setShowCreate(true)}>
                <Plus className="size-4" />
                تصنيف جديد
              </Button>
            ) : null
          }
        />
      ) : (
        <AdminPanel
          title="قائمة التصنيفات"
          description="التصنيفات الرئيسية والفرعية كما تظهر في الموقع"
          badge={totalCount}
          flush
          footer={
            <AdminPagination
              currentPage={currentPage}
              lastPage={lastPage}
              total={tableRows.length}
              pageSize={pageSize}
              onPageChange={setPage}
              label="صفحات التصنيفات"
            />
          }
        >
          <div className="admin-categories-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الترتيب</TableHead>
                  <TableHead>العربية</TableHead>
                  <TableHead className="admin-table-ltr">الإنجليزية</TableHead>
                  <TableHead className="admin-table-ltr">Slug</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>نشط</TableHead>
                  {canManage ? <TableHead>إجراءات</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedRows.map(({ category, isChild }) => {
                  const isEditing = editingId === category.id && !!editDraft;
                  const isAddingSub = subcategoryParentId === category.id;

                  return (
                    <Fragment key={category.id}>
                      <TableRow
                        className={cn(
                          isChild && "is-child",
                          isEditing && "is-editing",
                          isAddingSub && "is-adding-sub",
                        )}
                      >
                        <TableCell>
                          <span className="admin-categories-table__order">
                            {category.sort_order}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div
                            className={cn(
                              "admin-categories-table__name",
                              isChild && "is-child",
                            )}
                          >
                            <span
                              className={cn(
                                "admin-categories-table__name-icon",
                                isChild && "is-child",
                              )}
                            >
                              <Folder className={isChild ? "size-3.5" : "size-4"} />
                            </span>
                            <span className="admin-categories-table__name-text">
                              {category.name_ar}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="admin-table-ltr">
                          <span className="admin-categories-table__en">
                            {category.name_en}
                          </span>
                        </TableCell>
                        <TableCell className="admin-table-ltr">
                          <span className="admin-categories-table__slug" dir="ltr">
                            {category.slug}
                          </span>
                        </TableCell>
                        <TableCell className="admin-categories-table__desc whitespace-normal">
                          {category.description?.trim() || "—"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "admin-categories-table__status",
                              category.is_active
                                ? "admin-categories-table__status--on"
                                : "admin-categories-table__status--off",
                            )}
                          >
                            {category.is_active ? (
                              <Check className="size-3" />
                            ) : null}
                            {category.is_active ? "نعم" : "لا"}
                          </span>
                        </TableCell>
                        {canManage ? (
                          <TableCell>
                            <div className="admin-categories-table__actions">
                              <Button
                                variant="outline"
                                size="sm"
                                aria-label={`تعديل ${category.name_ar}`}
                                onClick={() => startEdit(category, isChild)}
                              >
                                <Pencil className="size-3.5" />
                                تعديل
                              </Button>
                              {!isChild ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  aria-label={`إضافة تصنيف فرعي تحت ${category.name_ar}`}
                                  onClick={() => {
                                    setSubcategoryParentId(category.id);
                                    setSubCreateForm(emptyCreateForm());
                                    setShowCreate(false);
                                    cancelEdit();
                                  }}
                                >
                                  <Plus className="size-3.5" />
                                  فرعي
                                </Button>
                              ) : null}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                aria-label={`حذف ${category.name_ar}`}
                                onClick={() =>
                                  setDeleteTarget({ category, isChild })
                                }
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="size-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        ) : null}
                      </TableRow>
                      {canManage && isEditing && editDraft ? (
                        <TableRow>
                          <TableCell
                            colSpan={columnCount}
                            className="bg-[#fafafa] whitespace-normal p-0"
                          >
                            <div className="admin-categories-edit">
                              <p className="admin-categories-edit__title">
                                تعديل «{category.name_ar}»
                              </p>
                              <div className="admin-categories-form">
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
                                <div className="admin-categories-form__wide space-y-2">
                                  <Label>Slug (ثابت)</Label>
                                  <Input
                                    value={category.slug}
                                    disabled
                                    dir="ltr"
                                    className="admin-table-ltr"
                                  />
                                </div>
                                <div className="admin-categories-form__wide space-y-2">
                                  <Label>الوصف</Label>
                                  <Textarea
                                    value={editDraft.description}
                                    onChange={(e) =>
                                      setEditDraft({
                                        ...editDraft,
                                        description: e.target.value,
                                      })
                                    }
                                    rows={2}
                                  />
                                </div>
                                {editDraft.isChild ? (
                                  <div className="admin-categories-form__wide space-y-2">
                                    <Label>التصنيف الرئيسي</Label>
                                    <Select
                                      value={
                                        editDraft.parent_id
                                          ? String(editDraft.parent_id)
                                          : ""
                                      }
                                      onValueChange={(value) =>
                                        setEditDraft({
                                          ...editDraft,
                                          parent_id: Number(value),
                                        })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="اختر التصنيف الرئيسي" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {topLevelCategories.map((parent) => (
                                          <SelectItem
                                            key={parent.id}
                                            value={String(parent.id)}
                                          >
                                            {parent.name_ar}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                ) : null}
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
                                <label className="admin-categories-form__active">
                                  <Checkbox
                                    checked={editDraft.is_active}
                                    onCheckedChange={(v) =>
                                      setEditDraft({
                                        ...editDraft,
                                        is_active: v === true,
                                      })
                                    }
                                  />
                                  نشط (يظهر للجمهور)
                                </label>
                              </div>
                              <div className="mt-4 flex gap-2">
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
                                  onClick={cancelEdit}
                                >
                                  إلغاء
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </AdminPanel>
      )}

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              {deleteTarget?.isChild
                ? `هل تريد حذف التصنيف الفرعي «${deleteTarget.category.name_ar}»؟`
                : deleteTarget?.category.children?.length
                  ? `حذف «${deleteTarget.category.name_ar}» سيجعل تصنيفاته الفرعية تصنيفات رئيسية مستقلة.`
                  : `هل تريد حذف «${deleteTarget?.category.name_ar}»؟`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.category.id)
              }
            >
              {deleteMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CategoryFormFields({
  values,
  onChange,
  idPrefix,
}: {
  values: ReturnType<typeof emptyCreateForm>;
  onChange: (values: ReturnType<typeof emptyCreateForm>) => void;
  idPrefix: string;
}) {
  return (
    <div className="admin-categories-form">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-name-ar`}>الاسم بالعربية</Label>
        <Input
          id={`${idPrefix}-name-ar`}
          value={values.nameAr}
          onChange={(e) => onChange({ ...values, nameAr: e.target.value })}
          placeholder="مثال: تقارير"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-name-en`}>الاسم بالإنجليزية</Label>
        <Input
          id={`${idPrefix}-name-en`}
          value={values.nameEn}
          onChange={(e) => onChange({ ...values, nameEn: e.target.value })}
          placeholder="Reports"
          dir="ltr"
        />
      </div>
      <div className="admin-categories-form__wide space-y-2">
        <Label htmlFor={`${idPrefix}-description`}>الوصف</Label>
        <Textarea
          id={`${idPrefix}-description`}
          value={values.description}
          onChange={(e) => onChange({ ...values, description: e.target.value })}
          placeholder="يظهر في صفحة التصنيف للجمهور"
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-sort`}>ترتيب العرض</Label>
        <Input
          id={`${idPrefix}-sort`}
          type="number"
          min={0}
          value={values.sortOrder}
          onChange={(e) => onChange({ ...values, sortOrder: e.target.value })}
        />
      </div>
      <label className="admin-categories-form__active">
        <Checkbox
          checked={values.isActive}
          onCheckedChange={(v) => onChange({ ...values, isActive: v === true })}
        />
        نشط (يظهر للجمهور)
      </label>
    </div>
  );
}
