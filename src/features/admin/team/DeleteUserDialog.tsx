import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { User } from "@/types";
import { Loader2 } from "lucide-react";

interface DeleteUserDialogProps {
  user: User | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (id: number) => void;
}

export function DeleteUserDialog({
  user,
  isPending,
  onClose,
  onConfirm,
}: DeleteUserDialogProps) {
  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تأكيد الحذف</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          هل تريد حذف {user?.name}؟ لا يمكن التراجع عن هذا الإجراء.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() => user && onConfirm(user.id)}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            حذف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
