import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { PublicPagination } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-data";
import { ToolPageShell } from "../pages/ToolPageShell";

interface VoiceAssetListResult<T> {
  items: T[];
  pagination?: PublicPagination;
}

interface VoiceAssetLibraryPageProps<T extends { id: number }> {
  title: string;
  queryKey: string[];
  emptyMessage: string;
  fetchPage: (page: number) => Promise<VoiceAssetListResult<T>>;
  deleteItem: (id: number) => Promise<unknown>;
  getDeleteLabel: (item: T) => string;
  canRename: (item: T) => boolean;
  canDelete: (item: T) => boolean;
  renderItem: (props: {
    item: T;
    canRename: boolean;
    canDelete: boolean;
    onDelete: () => void;
    onRenamed: () => void;
    isDeleting: boolean;
  }) => ReactNode;
}

export function VoiceAssetLibraryPage<T extends { id: number }>({
  title,
  queryKey,
  emptyMessage,
  fetchPage,
  deleteItem,
  getDeleteLabel,
  canRename,
  canDelete,
  renderItem,
}: VoiceAssetLibraryPageProps<T>) {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: [...queryKey, page],
    queryFn: () => fetchPage(page),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      toast.success("تم الحذف");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const items = listQuery.data?.items ?? [];
  const pagination = listQuery.data?.pagination;

  const confirmDelete = (item: T) => {
    if (window.confirm(`حذف "${getDeleteLabel(item)}"؟`)) {
      deleteMutation.mutate(item.id);
    }
  };

  const handleRenamed = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return (
    <ToolPageShell title={title}>
      {listQuery.isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) =>
            renderItem({
              item,
              canRename: canRename(item),
              canDelete: canDelete(item),
              onDelete: () => confirmDelete(item),
              onRenamed: handleRenamed,
              isDeleting: deleteMutation.isPending,
            }),
          )}

          {pagination && pagination.last_page > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {pagination.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.last_page}
                onClick={() => setPage((current) => current + 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </ToolPageShell>
  );
}
