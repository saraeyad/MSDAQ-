import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth";
import { AdminEmptyState } from "@/features/admin/components/AdminEmptyState";
import { AdminFilterBar } from "@/features/admin/components/AdminFilterBar";
import { AdminLoadingState } from "@/features/admin/components/AdminLoadingState";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { AdminPanel } from "@/features/admin/components/AdminPanel";
import { PermissionPicker } from "@/features/admin/components/PermissionPicker";
import { getApiErrorMessage } from "@/lib/api-data";
import { SUPER_ADMIN_ROLE } from "@/router/routes";
import { AdminRoles_APIs, AdminUsers_APIs } from "@/services/api/admin";
import type { Role, User } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function TeamManagementPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createPasswordConfirm, setCreatePasswordConfirm] = useState("");
  const [createRole, setCreateRole] = useState<string | undefined>();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editPasswordConfirm, setEditPasswordConfirm] = useState("");
  const [assignRoleName, setAssignRoleName] = useState<string | undefined>();
  const [directPermsToAdd, setDirectPermsToAdd] = useState<string[]>([]);
  const [directPermsToRemove, setDirectPermsToRemove] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const listQuery = useQuery({
    queryKey: ["admin-users", search, roleFilter, page],
    queryFn: () =>
      AdminUsers_APIs.list({
        page,
        search: search || undefined,
        role: roleFilter === "all" ? undefined : roleFilter,
      }),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: () => AdminRoles_APIs.list(),
  });

  const { data: permissionCatalog = [] } = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: () => AdminRoles_APIs.permissions(),
  });

  const users = listQuery.data?.items ?? [];
  const pagination = listQuery.data?.pagination;

  const invalidateUsers = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  };

  const openEdit = (user: User) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPassword("");
    setEditPasswordConfirm("");
    setAssignRoleName(undefined);
    setDirectPermsToAdd([]);
    setDirectPermsToRemove([]);
  };

  const createMutation = useMutation({
    mutationFn: () =>
      AdminUsers_APIs.create({
        name: createName.trim(),
        email: createEmail.trim(),
        password: createPassword,
        password_confirmation: createPasswordConfirm,
        role: createRole!,
      }),
    onSuccess: () => {
      toast.success("تمت إضافة العضو");
      invalidateUsers();
      setShowCreate(false);
      setCreateName("");
      setCreateEmail("");
      setCreatePassword("");
      setCreatePasswordConfirm("");
      setCreateRole(undefined);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) return;
      const payload: {
        name?: string;
        email?: string;
        password?: string;
        password_confirmation?: string;
      } = {};

      if (editName.trim() !== selectedUser.name) payload.name = editName.trim();
      if (editEmail.trim() !== selectedUser.email) {
        payload.email = editEmail.trim();
      }
      if (editPassword) {
        payload.password = editPassword;
        payload.password_confirmation = editPasswordConfirm;
      }

      if (Object.keys(payload).length > 0) {
        await AdminUsers_APIs.update(selectedUser.id, payload);
      }
    },
    onSuccess: () => {
      toast.success("تم تحديث البيانات");
      invalidateUsers();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const assignRoleMutation = useMutation({
    mutationFn: () =>
      AdminUsers_APIs.assignRole(selectedUser!.id, assignRoleName!),
    onSuccess: (data) => {
      toast.success("تم تعيين الدور");
      setSelectedUser((prev) =>
        prev
          ? { ...prev, roles: data.roles, permissions: data.user.permissions }
          : prev,
      );
      invalidateUsers();
      setAssignRoleName(undefined);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const revokeRoleMutation = useMutation({
    mutationFn: (role: string) =>
      AdminUsers_APIs.revokeRole(selectedUser!.id, role),
    onSuccess: (data) => {
      toast.success("تم سحب الدور");
      setSelectedUser((prev) =>
        prev
          ? { ...prev, roles: data.roles, permissions: data.user.permissions }
          : prev,
      );
      invalidateUsers();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const assignPermsMutation = useMutation({
    mutationFn: () =>
      AdminUsers_APIs.assignPermissions(selectedUser!.id, directPermsToAdd),
    onSuccess: (data) => {
      toast.success("تم منح الصلاحيات");
      setSelectedUser((prev) =>
        prev ? { ...prev, permissions: data.permissions } : prev,
      );
      setDirectPermsToAdd([]);
      invalidateUsers();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const revokePermsMutation = useMutation({
    mutationFn: () =>
      AdminUsers_APIs.revokePermissions(selectedUser!.id, directPermsToRemove),
    onSuccess: (data) => {
      toast.success("تم سحب الصلاحيات");
      setSelectedUser((prev) =>
        prev ? { ...prev, permissions: data.permissions } : prev,
      );
      setDirectPermsToRemove([]);
      invalidateUsers();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => AdminUsers_APIs.delete(id),
    onSuccess: () => {
      toast.success("تم حذف العضو");
      setDeleteTarget(null);
      setSelectedUser(null);
      invalidateUsers();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const isSelf = (user: User) => user.id === currentUser?.id;

  const canRevokeRole = (user: User, role: string) => {
    if (isSelf(user) && role === SUPER_ADMIN_ROLE) return false;
    return true;
  };

  const availableRolesToAssign = roles.filter(
    (r) => !selectedUser?.roles.includes(r.name),
  );

  const submitSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="إدارة الفريق"
        description="إضافة وتعديل أعضاء الفريق وأدوارهم"
        actions={
          <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
            <UserPlus className="size-4" />
            إضافة عضو
          </Button>
        }
      />

      <AdminFilterBar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={submitSearch}
        searchPlaceholder="بحث بالاسم أو البريد..."
      >
        <Select
          value={roleFilter}
          onValueChange={(v) => {
            setRoleFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="كل الأدوار" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأدوار</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.name}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AdminFilterBar>

      {showCreate ? (
        <AdminPanel
          title="عضو جديد"
          icon={UserPlus}
          footer={
            <Button
              onClick={() => createMutation.mutate()}
              disabled={
                createMutation.isPending ||
                !createName ||
                !createEmail ||
                !createPassword ||
                createPassword !== createPasswordConfirm ||
                !createRole
              }
            >
              {createMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              حفظ
            </Button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>الاسم</Label>
              <Input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>كلمة المرور</Label>
              <Input
                type="password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>تأكيد كلمة المرور</Label>
              <Input
                type="password"
                value={createPasswordConfirm}
                onChange={(e) => setCreatePasswordConfirm(e.target.value)}
                dir="ltr"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>الدور</Label>
              <Select value={createRole} onValueChange={setCreateRole}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </AdminPanel>
      ) : null}

      {listQuery.isLoading ? (
        <AdminLoadingState variant="table" />
      ) : listQuery.isError ? (
        <AdminEmptyState
          icon={Users}
          title="تعذّر تحميل أعضاء الفريق"
          description="تحقق من الاتصال أو الصلاحيات ثم أعد المحاولة."
        />
      ) : users.length === 0 ? (
        <AdminEmptyState
          icon={Users}
          title="لا يوجد أعضاء مطابقون"
          description="جرّب تغيير البحث أو الفلاتر."
        />
      ) : (
        <AdminPanel
          title="أعضاء الفريق"
          badge={pagination?.total ?? users.length}
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
                  {pagination.current_page} / {pagination.last_page}
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد</TableHead>
                <TableHead>الأدوار</TableHead>
                <TableHead>الصلاحيات</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
                <TableHead>إجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell dir="ltr">{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(user.roles ?? []).map((role) => (
                        <Badge key={role} variant="secondary">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {(user.permissions ?? []).length}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString("ar")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(user)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isSelf(user)}
                        onClick={() => setDeleteTarget(user)}
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AdminPanel>
      )}

      <Dialog
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {selectedUser ? (
            <>
              <DialogHeader>
                <DialogTitle>{selectedUser.name}</DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile">البيانات</TabsTrigger>
                  <TabsTrigger value="roles">الأدوار</TabsTrigger>
                  <TabsTrigger value="permissions">الصلاحيات</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4 pt-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label>الاسم</Label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>البريد</Label>
                      <Input
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>كلمة مرور جديدة (اختياري)</Label>
                      <Input
                        type="password"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>تأكيد كلمة المرور</Label>
                      <Input
                        type="password"
                        value={editPasswordConfirm}
                        onChange={(e) => setEditPasswordConfirm(e.target.value)}
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => updateMutation.mutate()}
                    disabled={
                      updateMutation.isPending ||
                      (editPassword !== "" &&
                        editPassword !== editPasswordConfirm)
                    }
                  >
                    {updateMutation.isPending && (
                      <Loader2 className="size-4 animate-spin" />
                    )}
                    حفظ البيانات
                  </Button>
                </TabsContent>

                <TabsContent value="roles" className="space-y-4 pt-4">
                  <div className="flex flex-wrap gap-2">
                    {(selectedUser.roles ?? []).map((role) => (
                      <Badge key={role} variant="secondary" className="gap-1">
                        {role}
                        {canRevokeRole(selectedUser, role) ? (
                          <button
                            type="button"
                            className="ms-1 hover:text-destructive"
                            onClick={() => revokeRoleMutation.mutate(role)}
                          >
                            <X className="size-3" />
                          </button>
                        ) : null}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-end gap-2">
                    <Select
                      value={assignRoleName}
                      onValueChange={setAssignRoleName}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="إضافة دور" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRolesToAssign.map((role: Role) => (
                          <SelectItem key={role.id} value={role.name}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!assignRoleName || assignRoleMutation.isPending}
                      onClick={() => assignRoleMutation.mutate()}
                    >
                      تعيين
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="permissions" className="space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.permissions.length} صلاحية فعّالة
                  </p>
                  <div className="space-y-2">
                    <Label>منح صلاحيات إضافية</Label>
                    <PermissionPicker
                      catalog={permissionCatalog.filter(
                        (p) => !selectedUser.permissions.includes(p),
                      )}
                      selected={directPermsToAdd}
                      onChange={setDirectPermsToAdd}
                      compact
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={
                        directPermsToAdd.length === 0 ||
                        assignPermsMutation.isPending
                      }
                      onClick={() => assignPermsMutation.mutate()}
                    >
                      منح المحدّد
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>سحب صلاحيات</Label>
                    <PermissionPicker
                      catalog={selectedUser.permissions}
                      selected={directPermsToRemove}
                      onChange={setDirectPermsToRemove}
                      compact
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={
                        directPermsToRemove.length === 0 ||
                        revokePermsMutation.isPending
                      }
                      onClick={() => revokePermsMutation.mutate()}
                    >
                      سحب المحدّد
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  إغلاق
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            هل تريد حذف {deleteTarget?.name}؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
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
