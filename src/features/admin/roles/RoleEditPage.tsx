import { Button } from "@/components/ui/button";
import { AdminEmptyState } from "@/features/admin/components/AdminEmptyState";
import { AdminLoadingState } from "@/features/admin/components/AdminLoadingState";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { AdminPanel } from "@/features/admin/components/AdminPanel";
import { PermissionPicker } from "@/features/admin/components/PermissionPicker";
import { getApiErrorMessage } from "@/lib/api-data";
import { rolePurpose } from "@/lib/role-labels";
import { ROUTES } from "@/router/routes";
import { AdminRoles_APIs } from "@/services/api/admin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Loader2, Lock, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function RoleEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const roleId = Number(id);
  const validId = Number.isFinite(roleId) && roleId > 0;

  const [editPerms, setEditPerms] = useState<string[]>([]);

  const roleQuery = useQuery({
    queryKey: ["admin-role", roleId],
    queryFn: async () => {
      const roles = await AdminRoles_APIs.list();
      const role = roles.find((entry) => entry.id === roleId);
      if (!role) throw new Error("Role not found");
      return role;
    },
    enabled: validId,
  });

  const catalogQuery = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: () => AdminRoles_APIs.permissions(),
  });

  const role = roleQuery.data;
  const protectedRole = role?.is_protected ?? false;

  useEffect(() => {
    if (role) setEditPerms(role.permissions ?? []);
  }, [role]);

  const updateMutation = useMutation({
    mutationFn: () =>
      AdminRoles_APIs.update(roleId, { permissions: editPerms }),
    onSuccess: () => {
      toast.success("تم تحديث الصلاحيات");
      void queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-role", roleId] });
      navigate(ROUTES.ADMIN_ROLES);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  if (!validId) {
    return (
      <AdminEmptyState
        icon={Shield}
        title="دور غير صالح"
        description="معرّف الدور غير صحيح."
        action={
          <Button asChild variant="outline">
            <Link to={ROUTES.ADMIN_ROLES}>العودة للأدوار</Link>
          </Button>
        }
      />
    );
  }

  if (roleQuery.isLoading || catalogQuery.isLoading) {
    return <AdminLoadingState variant="form" />;
  }

  if (roleQuery.isError || !role) {
    return (
      <AdminEmptyState
        icon={Shield}
        title="تعذّر تحميل الدور"
        description="تحقق من الاتصال أو أن الدور موجود ثم أعد المحاولة."
        action={
          <Button asChild variant="outline">
            <Link to={ROUTES.ADMIN_ROLES}>العودة للأدوار</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={role.name}
        description={
          rolePurpose(role.name) ??
          (protectedRole
            ? "دور محمي — يمكن عرض الصلاحيات فقط"
            : "حدّد الصلاحيات المرتبطة بهذا الدور")
        }
        actions={
          <Button asChild variant="outline" className="gap-2">
            <Link to={ROUTES.ADMIN_ROLES}>
              <ArrowRight className="size-4" />
              العودة للأدوار
            </Link>
          </Button>
        }
      />

      <AdminPanel
        title="صلاحيات الدور"
        icon={Shield}
        accent={protectedRole ? "warning" : "primary"}
        badge={`${editPerms.length} محدّد`}
        footer={
          protectedRole ? undefined : (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                حفظ التغييرات
              </Button>
              <Button asChild variant="outline">
                <Link to={ROUTES.ADMIN_ROLES}>إلغاء</Link>
              </Button>
            </div>
          )
        }
      >
        {protectedRole ? (
          <div className="admin-role-protected-banner">
            <Lock className="size-4 shrink-0" />
            <span>هذا دور نظامي محمي ولا يمكن تعديل صلاحياته.</span>
          </div>
        ) : null}

        <PermissionPicker
          catalog={catalogQuery.data ?? []}
          selected={editPerms}
          onChange={setEditPerms}
          disabled={protectedRole}
        />
      </AdminPanel>
    </div>
  );
}
