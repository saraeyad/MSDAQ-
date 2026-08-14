import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LibraryItem } from "@/types";
import { Loader2 } from "lucide-react";

interface DeleteLibraryItemDialogProps {
  item: LibraryItem | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (id: number) => void;
}

export function DeleteLibraryItemDialog({
  item,
  isPending,
  onClose,
  onConfirm,
}: DeleteLibraryItemDialogProps) {
  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تأكيد الحذف</DialogTitle>
          <DialogDescription>
            هل تريد حذف «{item?.title}»؟ لا يمكن التراجع عن هذا الإجراء.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            إلغاء
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() => item && onConfirm(item.id)}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            حذف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
