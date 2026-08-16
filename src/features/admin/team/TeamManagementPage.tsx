import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { AdminPagination } from "@/features/admin/components/AdminPagination";
import { AdminPanel } from "@/features/admin/components/AdminPanel";
import { PermissionPicker } from "@/features/admin/components/PermissionPicker";
import { getApiErrorMessage } from "@/lib/api-data";
import { paginateList, TABLE_PAGE_SIZE } from "@/lib/table-pagination";
import { permissionLabel } from "@/lib/permission-labels";
import { ROUTES, SUPER_ADMIN_ROLE } from "@/router/routes";
import { AdminRoles_APIs, AdminUsers_APIs } from "@/services/api/admin";
import type { Role, User } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  KeyRound,
  Loader2,
  Lock,
  Pencil,
  Shield,
  Trash2,
  UserPlus,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { CreateUserPanel } from "./CreateUserPanel";
import { DeleteUserDialog } from "./DeleteUserDialog";

function permissionsFromPayload(data: {
  permissions?: string[];
  user?: { permissions?: string[] };
}): string[] | undefined {
  return data.permissions ?? data.user?.permissions;
}

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
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const listQuery = useQuery({
    queryKey: ["admin-users", search, roleFilter, page],
    queryFn: () =>
      AdminUsers_APIs.list({
        page,
        per_page: TABLE_PAGE_SIZE,
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

  const rawUsers = listQuery.data?.items ?? [];
  const {
    items: users,
    total,
    currentPage,
    lastPage,
    pageSize,
  } = paginateList(rawUsers, page, listQuery.data?.pagination);

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
  };

  const resetCreateForm = () => {
    setShowCreate(false);
    setCreateName("");
    setCreateEmail("");
    setCreatePassword("");
    setCreatePasswordConfirm("");
    setCreateRole(undefined);
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
      resetCreateForm();
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

  const roleGrantedPerms = useMemo(() => {
    if (!selectedUser) return new Set<string>();
    return new Set(
      roles
        .filter((role) => selectedUser.roles.includes(role.name))
        .flatMap((role) => role.permissions ?? []),
    );
  }, [roles, selectedUser]);

  const directPerms = useMemo(() => {
    if (!selectedUser) return [];
    return (selectedUser.permissions ?? []).filter(
      (perm) => !roleGrantedPerms.has(perm),
    );
  }, [selectedUser, roleGrantedPerms]);

  const assignPermsMutation = useMutation({
    mutationFn: () =>
      AdminUsers_APIs.assignPermissions(selectedUser!.id, directPermsToAdd),
    onSuccess: (data) => {
      toast.success("تم منح الصلاحيات");
      const next = permissionsFromPayload(data);
      setSelectedUser((prev) =>
        prev ? { ...prev, permissions: next ?? prev.permissions } : prev,
      );
      setDirectPermsToAdd([]);
      invalidateUsers();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const revokePermsMutation = useMutation({
    mutationFn: (permissions: string[]) =>
      AdminUsers_APIs.revokePermissions(selectedUser!.id, permissions),
    onSuccess: (data, revoked) => {
      const next = permissionsFromPayload(data);
      const stillThere = next
        ? revoked.filter((perm) => next.includes(perm))
        : [];

      if (stillThere.length > 0) {
        toast.error(
          "هذه الصلاحية قادمة من الدور — عدّل الدور أو اسحبه من تبويب الأدوار.",
        );
        setSelectedUser((prev) =>
          prev ? { ...prev, permissions: next ?? prev.permissions } : prev,
        );
        return;
      }

      toast.success("تم سحب الصلاحية");
      setSelectedUser((prev) =>
        prev
          ? {
              ...prev,
              permissions:
                next ??
                (prev.permissions ?? []).filter((perm) => !revoked.includes(perm)),
            }
          : prev,
      );
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
      if (users.length === 1 && page > 1) {
        setPage((p) => p - 1);
      }
      invalidateUsers();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const isSelf = (user: User) => user.id === currentUser?.id;

  const canRevokeRole = (user: User, role: string) => {
    if (isSelf(user) && role === SUPER_ADMIN_ROLE) return false;
    if (role === SUPER_ADMIN_ROLE) {
      const superAdmins = rawUsers.filter((u) =>
        u.roles.includes(SUPER_ADMIN_ROLE),
      );
      if (
        superAdmins.length <= 1 &&
        superAdmins.some((u) => u.id === user.id)
      ) {
        return false;
      }
    }
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
          <Button onClick={() => setShowCreate(!showCreate)}>
            {!showCreate ? <UserPlus className="size-4" /> : null}
            {showCreate ? "إخفاء النموذج" : "إضافة عضو"}
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
        <CreateUserPanel
          roles={roles}
          name={createName}
          email={createEmail}
          password={createPassword}
          passwordConfirm={createPasswordConfirm}
          role={createRole}
          isPending={createMutation.isPending}
          onNameChange={setCreateName}
          onEmailChange={setCreateEmail}
          onPasswordChange={setCreatePassword}
          onPasswordConfirmChange={setCreatePasswordConfirm}
          onRoleChange={setCreateRole}
          onSubmit={() => createMutation.mutate()}
          onCancel={resetCreateForm}
        />
      ) : null}

      {listQuery.isLoading ? (
        <AdminLoadingState variant="table" />
      ) : listQuery.isError ? (
        <AdminEmptyState
          icon={Users}
          title="تعذّر تحميل أعضاء الفريق"
          description="تحقق من الاتصال أو الصلاحيات ثم أعد المحاولة."
        />
      ) : rawUsers.length === 0 ? (
        <AdminEmptyState
          icon={Users}
          title="لا يوجد أعضاء مطابقون"
          description="جرّب تغيير البحث أو الفلاتر."
        />
      ) : (
        <AdminPanel
          title="أعضاء الفريق"
          description="الأسماء والأدوار والصلاحيات الحالية"
          badge={total}
          flush
          footer={
            <AdminPagination
              currentPage={currentPage}
              lastPage={lastPage}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
              label="صفحات الفريق"
            />
          }
        >
          <div className="admin-team-table">
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
                    <TableCell>
                      <div className="admin-team-table__person">
                        <span className="admin-team-table__avatar">
                          {user.name.trim().charAt(0) || "؟"}
                        </span>
                        <div>
                          <p className="admin-team-table__name">{user.name}</p>
                          {isSelf(user) ? (
                            <p className="admin-team-table__you">حسابك</p>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="admin-table-ltr">
                      <span className="admin-team-table__email" dir="ltr">
                        {user.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(user.roles ?? []).map((role) => (
                          <Badge key={role} variant="secondary">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="admin-team-table__count">
                        {(user.permissions ?? []).length}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString("ar")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={`تعديل ${user.name}`}
                          onClick={() => openEdit(user)}
                        >
                          <Pencil className="size-3.5" />
                          تعديل
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          disabled={isSelf(user)}
                          aria-label={`حذف ${user.name}`}
                          onClick={() => setDeleteTarget(user)}
                        >
                          <Trash2 className="size-4 text-destructive" />
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

      <Dialog
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      >
        <DialogContent className="admin-team-dialog flex max-h-[90vh] flex-col overflow-hidden sm:max-w-xl">
          {selectedUser ? (
            <>
              <DialogHeader>
                <div className="admin-team-dialog__person">
                  <span className="admin-team-dialog__avatar">
                    {selectedUser.name.trim().charAt(0) || "؟"}
                  </span>
                  <div className="min-w-0">
                    <DialogTitle>{selectedUser.name}</DialogTitle>
                    <p className="admin-team-dialog__email" dir="ltr">
                      {selectedUser.email}
                    </p>
                    <div className="admin-team-dialog__chips">
                      {(selectedUser.roles ?? []).map((role) => (
                        <span key={role} className="admin-team-dialog__chip">
                          {role}
                        </span>
                      ))}
                      {isSelf(selectedUser) ? (
                        <span className="admin-team-dialog__chip admin-team-dialog__chip--you">
                          حسابك
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="profile" className="admin-team-dialog__tabs">
                <TabsList className="admin-team-dialog__tablist">
                  <TabsTrigger value="profile">
                    <UserRound />
                    البيانات
                  </TabsTrigger>
                  <TabsTrigger value="roles">
                    <Shield />
                    الأدوار
                  </TabsTrigger>
                  <TabsTrigger value="permissions">
                    <KeyRound />
                    الصلاحيات
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="admin-team-dialog__pane">
                  <div className="admin-team-dialog__card">
                    <p className="admin-team-dialog__card-title">بيانات الحساب</p>
                    <div className="admin-team-dialog__fields">
                      <div className="space-y-1.5">
                        <Label>الاسم</Label>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>البريد</Label>
                        <Input
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>كلمة مرور جديدة (اختياري)</Label>
                        <Input
                          type="password"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-1.5">
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
                      className="admin-team-dialog__action"
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
                  </div>
                </TabsContent>

                <TabsContent value="roles" className="admin-team-dialog__pane">
                  <div className="admin-team-dialog__card">
                    <p className="admin-team-dialog__card-title">
                      الأدوار الحالية
                    </p>
                    {(selectedUser.roles ?? []).length > 0 ? (
                      <div className="admin-team-dialog__roles">
                        {(selectedUser.roles ?? []).map((role) => (
                          <span key={role} className="admin-team-dialog__role">
                            <Shield className="size-3.5" />
                            {role}
                            {canRevokeRole(selectedUser, role) ? (
                              <button
                                type="button"
                                className="admin-team-dialog__role-remove"
                                aria-label={`سحب دور ${role}`}
                                onClick={() => revokeRoleMutation.mutate(role)}
                              >
                                <X className="size-3" />
                              </button>
                            ) : null}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="admin-team-dialog__empty">
                        لا توجد أدوار معيّنة لهذا العضو.
                      </p>
                    )}
                  </div>

                  <div className="admin-team-dialog__card">
                    <p className="admin-team-dialog__card-title">تعيين دور جديد</p>
                    <div className="admin-team-dialog__assign">
                      <Select
                        value={assignRoleName}
                        onValueChange={setAssignRoleName}
                      >
                        <SelectTrigger className="admin-team-dialog__select">
                          <SelectValue placeholder="اختر دوراً لإضافته" />
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
                        disabled={
                          !assignRoleName || assignRoleMutation.isPending
                        }
                        onClick={() => assignRoleMutation.mutate()}
                      >
                        {assignRoleMutation.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : null}
                        تعيين
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="permissions"
                  className="admin-team-dialog__pane"
                >
                  <div className="admin-team-dialog__card">
                    <p className="admin-team-dialog__card-title">
                      الصلاحيات من الأدوار
                      <span className="admin-team-dialog__card-count">
                        {roleGrantedPerms.size}
                      </span>
                    </p>
                    <p className="admin-team-dialog__empty">
                      تُمنح عبر الدور — لتغييرها عدّل الدور في{" "}
                      <Link
                        to={ROUTES.ADMIN_ROLES}
                        className="font-semibold text-primary underline-offset-2 hover:underline"
                        onClick={() => setSelectedUser(null)}
                      >
                        الأدوار والصلاحيات
                      </Link>{" "}
                      أو اسحب الدور من تبويب الأدوار.
                    </p>
                    {roleGrantedPerms.size > 0 ? (
                      <div className="admin-team-dialog__roles">
                        {[...(selectedUser.permissions ?? [])]
                          .filter((perm) => roleGrantedPerms.has(perm))
                          .map((perm) => (
                            <span
                              key={perm}
                              className="admin-team-dialog__role admin-team-dialog__role--from-role"
                            >
                              <KeyRound className="size-3.5" />
                              {permissionLabel(perm)}
                              <span
                                className="admin-team-dialog__role-lock"
                                title="قادمة من الدور"
                              >
                                <Lock className="size-3" />
                              </span>
                            </span>
                          ))}
                      </div>
                    ) : (
                      <p className="admin-team-dialog__empty">
                        لا توجد صلاحيات من الأدوار.
                      </p>
                    )}
                  </div>

                  <div className="admin-team-dialog__card">
                    <p className="admin-team-dialog__card-title">
                      صلاحيات إضافية مباشرة
                      <span className="admin-team-dialog__card-count">
                        {directPerms.length}
                      </span>
                    </p>
                    <p className="admin-team-dialog__empty">
                      تُمنح مباشرة للعضو فوق صلاحيات دوره — يمكن سحبها من هنا.
                    </p>
                    {directPerms.length > 0 ? (
                      <div className="admin-team-dialog__roles">
                        {directPerms.map((perm) => (
                          <span key={perm} className="admin-team-dialog__role">
                            <KeyRound className="size-3.5" />
                            {permissionLabel(perm)}
                            <button
                              type="button"
                              className="admin-team-dialog__role-remove"
                              aria-label={`سحب صلاحية ${permissionLabel(perm)}`}
                              disabled={revokePermsMutation.isPending}
                              onClick={() => revokePermsMutation.mutate([perm])}
                            >
                              <X className="size-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="admin-team-dialog__empty">
                        لا توجد صلاحيات إضافية مباشرة.
                      </p>
                    )}
                  </div>

                  <div className="admin-team-dialog__card">
                    <p className="admin-team-dialog__card-title">
                      منح صلاحيات إضافية
                    </p>
                    <PermissionPicker
                      catalog={permissionCatalog.filter(
                        (p) => !(selectedUser.permissions ?? []).includes(p),
                      )}
                      selected={directPermsToAdd}
                      onChange={setDirectPermsToAdd}
                    />
                    <div className="admin-team-dialog__grant-bar">
                      <Button
                        className="admin-team-dialog__grant-btn"
                        size="lg"
                        disabled={
                          directPermsToAdd.length === 0 ||
                          assignPermsMutation.isPending
                        }
                        onClick={() => assignPermsMutation.mutate()}
                      >
                        {assignPermsMutation.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : null}
                        منح المحدّد
                        {directPermsToAdd.length > 0 ? (
                          <span className="admin-team-dialog__grant-count">
                            {directPermsToAdd.length}
                          </span>
                        ) : null}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <DeleteUserDialog
        user={deleteTarget}
        isPending={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={(id) => deleteMutation.mutate(id)}
      />
    </div>
  );
}
