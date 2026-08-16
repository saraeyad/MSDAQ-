import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminEmptyState } from "@/features/admin/components/AdminEmptyState";
import { AdminLoadingState } from "@/features/admin/components/AdminLoadingState";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { AdminPagination } from "@/features/admin/components/AdminPagination";
import { AdminPanel } from "@/features/admin/components/AdminPanel";
import { PermissionPicker } from "@/features/admin/components/PermissionPicker";
import { getApiErrorMessage } from "@/lib/api-data";
import { paginateList } from "@/lib/table-pagination";
import { rolePurpose } from "@/lib/role-labels";
import { adminRoleEditPath } from "@/router/routes";
import { AdminRoles_APIs } from "@/services/api/admin";
import type { Role } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Lock, Pencil, Plus, Shield, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function RolesManagementPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPerms, setNewPerms] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [page, setPage] = useState(1);

  const {
    data: roles = [],
    isError: rolesError,
    isLoading: rolesLoading,
  } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: () => AdminRoles_APIs.list(),
  });

  const {
    data: catalog = [],
    isLoading: catalogLoading,
    isError: catalogError,
  } = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: () => AdminRoles_APIs.permissions(),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
  };

  const resetCreateForm = () => {
    setNewName("");
    setNewPerms([]);
    setShowCreate(false);
  };

  const createMutation = useMutation({
    mutationFn: () =>
      AdminRoles_APIs.create({ name: newName.trim(), permissions: newPerms }),
    onSuccess: () => {
      toast.success("تم إنشاء الدور");
      invalidate();
      resetCreateForm();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => AdminRoles_APIs.delete(id),
    onSuccess: () => {
      toast.success("تم حذف الدور");
      setDeleteTarget(null);
      invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const handleDelete = (role: Role) => {
    if (role.is_protected || role.users_count > 0) return;
    setDeleteTarget(role);
  };

  const canDeleteRole = (role: Role) =>
    !role.is_protected && role.users_count === 0;

  const {
    items: pagedRoles,
    total,
    currentPage,
    lastPage,
    pageSize,
  } = paginateList(roles, page);

  if (rolesLoading || catalogLoading) {
    return <AdminLoadingState variant="table" />;
  }

  if (catalogError || rolesError) {
    return (
      <AdminEmptyState
        icon={Shield}
        title="تعذّر تحميل الأدوار"
        description="تحقق من الاتصال أو الصلاحيات ثم أعد المحاولة."
      />
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="الأدوار والصلاحيات"
        description="أنشئ أدواراً مخصصة وحدّد صلاحيات كل دور بسهولة"
        actions={
          <Button
            onClick={() => setShowCreate((open) => !open)}
            className={showCreate ? undefined : "gap-2"}
          >
            {!showCreate ? <Plus className="size-4" /> : null}
            {showCreate ? "إخفاء النموذج" : "دور جديد"}
          </Button>
        }
      />

      {showCreate ? (
        <AdminPanel
          title="دور جديد"
          icon={Plus}
          footer={
            <div className="flex gap-2">
              <Button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !newName.trim()}
              >
                {createMutation.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                إنشاء الدور
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetCreateForm}
                disabled={createMutation.isPending}
              >
                إلغاء
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>اسم الدور</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="مثال: copy-editor"
                className="max-w-md"
              />
            </div>
            <PermissionPicker
              catalog={catalog}
              selected={newPerms}
              onChange={setNewPerms}
            />
          </div>
        </AdminPanel>
      ) : null}

      {roles.length === 0 ? (
        <AdminEmptyState
          icon={Shield}
          title="لا توجد أدوار بعد"
          description="أنشئ دوراً جديداً لبدء إدارة الصلاحيات."
          action={
            <Button onClick={() => setShowCreate(true)} className="gap-2">
              <Plus className="size-4" />
              دور جديد
            </Button>
          }
        />
      ) : (
        <AdminPanel
          title="الأدوار"
          badge={total}
          flush
          footer={
            <AdminPagination
              currentPage={currentPage}
              lastPage={lastPage}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
              label="صفحات الأدوار"
            />
          }
        >
          <div className="admin-roles-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم الدور</TableHead>
                  <TableHead>الصلاحيات</TableHead>
                  <TableHead>الأعضاء</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="w-[7rem]">إجراء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="admin-roles-table__name">
                        <span className="admin-roles-table__name-icon">
                          <Shield className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <span className="font-medium">{role.name}</span>
                          {rolePurpose(role.name) ? (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {rolePurpose(role.name)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {role.permissions?.length ?? 0} صلاحية
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {role.users_count} عضو
                    </TableCell>
                    <TableCell>
                      {role.is_protected ? (
                        <Badge variant="outline" className="gap-1">
                          <Lock className="size-3" />
                          محمي
                        </Badge>
                      ) : (
                        <Badge variant="secondary">قابل للتعديل</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="admin-roles-table__actions">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          aria-label={`تعديل ${role.name}`}
                        >
                          <Link to={adminRoleEditPath(role.id)}>
                            <Pencil className="size-3.5" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            !canDeleteRole(role) || deleteMutation.isPending
                          }
                          title={
                            role.users_count > 0
                              ? "أعد تعيين الأعضاء قبل حذف الدور"
                              : role.is_protected
                                ? "دور محمي"
                                : undefined
                          }
                          aria-label={`حذف ${role.name}`}
                          onClick={() => handleDelete(role)}
                        >
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </AdminPanel>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        description={`هل تريد حذف الدور «${deleteTarget?.name}»؟ لا يمكن التراجع عن هذا الإجراء.`}
        isPending={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </div>
  );
}
