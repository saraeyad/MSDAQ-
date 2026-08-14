import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminPanel } from "@/features/admin/components/AdminPanel";
import type { Role } from "@/types";
import { Loader2, UserPlus } from "lucide-react";

interface CreateUserPanelProps {
  roles: Role[];
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  role: string | undefined;
  isPending: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onPasswordConfirmChange: (value: string) => void;
  onRoleChange: (value: string | undefined) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function CreateUserPanel({
  roles,
  name,
  email,
  password,
  passwordConfirm,
  role,
  isPending,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onPasswordConfirmChange,
  onRoleChange,
  onSubmit,
  onCancel,
}: CreateUserPanelProps) {
  const canSubmit =
    !!name &&
    !!email &&
    !!password &&
    password === passwordConfirm &&
    !!role;

  return (
    <AdminPanel
      title="عضو جديد"
      description="سيتمكن العضو من الدخول فور حفظ الحساب"
      icon={UserPlus}
      accent="primary"
      footer={
        <div className="flex gap-2">
          <Button onClick={onSubmit} disabled={isPending || !canSubmit}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            حفظ
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            إلغاء
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>الاسم</Label>
          <Input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="الاسم الكامل"
          />
        </div>
        <div className="space-y-2">
          <Label>البريد الإلكتروني</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <Label>كلمة المرور</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <Label>تأكيد كلمة المرور</Label>
          <Input
            type="password"
            value={passwordConfirm}
            onChange={(e) => onPasswordConfirmChange(e.target.value)}
            dir="ltr"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>الدور</Label>
          <Select value={role} onValueChange={onRoleChange}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="اختر الدور" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.id} value={r.name}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </AdminPanel>
  );
}
