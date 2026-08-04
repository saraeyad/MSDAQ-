import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminEmptyState } from "@/features/admin/components/AdminEmptyState";
import { AdminLoadingState } from "@/features/admin/components/AdminLoadingState";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { AdminPanel } from "@/features/admin/components/AdminPanel";
import { PermissionPicker } from "@/features/admin/components/PermissionPicker";
import { RolePermissionsSummary } from "@/features/admin/components/RolePermissionsSummary";
import { getApiErrorMessage } from "@/lib/api-data";
import { AdminRoles_APIs } from "@/services/api/admin";
import type { Role } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Lock, Plus, Shield, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function RolesManagementPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [newPerms, setNewPerms] = useState<string[]>([]);
  const [editPerms, setEditPerms] = useState<string[]>([]);

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

  const createMutation = useMutation({
    mutationFn: () =>
      AdminRoles_APIs.create({ name: newName.trim(), permissions: newPerms }),
    onSuccess: () => {
      toast.success("تم إنشاء الدور");
      invalidate();
      setNewName("");
      setNewPerms([]);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, permissions }: { id: number; permissions: string[] }) =>
      AdminRoles_APIs.update(id, { permissions }),
    onSuccess: () => {
      toast.success("تم تحديث الصلاحيات");
      invalidate();
      setEditingId(null);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => AdminRoles_APIs.delete(id),
    onSuccess: () => {
      toast.success("تم حذف الدور");
      invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  if (rolesLoading || catalogLoading) {
    return <AdminLoadingState variant="form" />;
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
    <div className="space-y-8">
      <AdminPageHeader
        title="الأدوار والصلاحيات"
        description="أنشئ أدواراً مخصصة وحدّد صلاحيات كل دور بسهولة"
      />

      <AdminPanel
        title="دور جديد"
        icon={Plus}
        footer={
          <Button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !newName.trim()}
          >
            {createMutation.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            إنشاء الدور
          </Button>
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

      <div className="space-y-4">
        {roles.length === 0 ? (
          <AdminEmptyState
            icon={Shield}
            title="لا توجد أدوار بعد"
            description="أنشئ دوراً جديداً لبدء إدارة الصلاحيات."
          />
        ) : (
          roles.map((role: Role) => {
            const protectedRole = role.is_protected;
            const isEditing = editingId === role.id;

            return (
              <AdminPanel
                key={role.id}
                title={role.name}
                badge={`${role.permissions?.length ?? 0} صلاحية · ${role.users_count} عضو`}
                headerActions={
                  <div className="flex items-center gap-2">
                    {protectedRole ? (
                      <Badge variant="secondary" className="gap-1">
                        <Lock className="size-3" />
                        محمي
                      </Badge>
                    ) : null}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={protectedRole}
                      onClick={() => {
                        if (isEditing) {
                          setEditingId(null);
                        } else {
                          setEditingId(role.id);
                          setEditPerms(role.permissions ?? []);
                        }
                      }}
                    >
                      {isEditing ? "إلغاء" : "تعديل"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={protectedRole || deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(role.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                }
                footer={
                  isEditing && !protectedRole ? (
                    <Button
                      size="sm"
                      onClick={() =>
                        updateMutation.mutate({
                          id: role.id,
                          permissions: editPerms,
                        })
                      }
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending && (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                      حفظ التغييرات
                    </Button>
                  ) : undefined
                }
              >
                {isEditing && !protectedRole ? (
                  <PermissionPicker
                    catalog={catalog}
                    selected={editPerms}
                    onChange={setEditPerms}
                  />
                ) : (
                  <RolePermissionsSummary
                    permissions={role.permissions ?? []}
                  />
                )}
              </AdminPanel>
            );
          })
        )}
      </div>
    </div>
  );
}
