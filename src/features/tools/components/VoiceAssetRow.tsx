import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-data";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

interface VoiceAssetRowProps {
  title: string;
  meta: ReactNode;
  canRename: boolean;
  canDelete: boolean;
  onDelete: () => void;
  onRename: (name: string) => Promise<void>;
  isDeleting: boolean;
  extraActions?: ReactNode;
  children?: ReactNode;
}

export function VoiceAssetRow({
  title,
  meta,
  canRename,
  canDelete,
  onDelete,
  onRename,
  isDeleting,
  extraActions,
  children,
}: VoiceAssetRowProps) {
  const [editing, setEditing] = useState(false);
  const [renameValue, setRenameValue] = useState(title);
  const [renaming, setRenaming] = useState(false);

  const submitRename = async () => {
    if (!renameValue.trim()) {
      toast.error("أدخل اسماً");
      return;
    }
    setRenaming(true);
    try {
      await onRename(renameValue.trim());
      setEditing(false);
      toast.success("تم تحديث الاسم");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setRenaming(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="flex flex-wrap gap-2">
                <Input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="max-w-xs"
                />
                <Button size="sm" onClick={submitRename} disabled={renaming}>
                  {renaming && <Loader2 className="size-4 animate-spin" />}
                  حفظ
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setRenameValue(title);
                  }}
                >
                  إلغاء
                </Button>
              </div>
            ) : (
              <p className="font-medium">{title}</p>
            )}
            <div className="text-xs text-muted-foreground">{meta}</div>
          </div>
          <div className="flex gap-2">
            {extraActions}
            {canRename && !editing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRenameValue(title);
                  setEditing(true);
                }}
              >
                <Pencil className="size-4" />
                إعادة تسمية
              </Button>
            )}
            {canDelete && (
              <Button
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={onDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" />
                حذف
              </Button>
            )}
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
