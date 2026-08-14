import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CalendarMoveScope } from "@/types";

interface RecurrenceMoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (scope: CalendarMoveScope) => void;
}

export function RecurrenceMoveDialog({
  open,
  onOpenChange,
  onSelect,
}: RecurrenceMoveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>نقل عنصر متكرر</DialogTitle>
          <DialogDescription>
            هل تريد نقل كل العناصر المتكررة أم هذا العنصر فقط؟
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onSelect("all")}>كل التكرارات</Button>
          <Button variant="outline" onClick={() => onSelect("single")}>
            هذا التكرار فقط
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
