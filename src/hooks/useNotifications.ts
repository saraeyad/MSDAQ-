import { useAuth } from "@/context/auth";
import { Notifications_APIs } from "@/services/api/notifications";
import type { AppNotification } from "@/types";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";

const UNREAD_KEY = ["notifications-unread"] as const;
const LIST_KEY = ["notifications-list"] as const;

export function useNotifications() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const enabled = Boolean(token);

  const unreadQuery = useQuery({
    queryKey: UNREAD_KEY,
    queryFn: Notifications_APIs.unreadCount,
    enabled,
    refetchInterval: 60_000,
  });

  const listQuery = useInfiniteQuery({
    queryKey: LIST_KEY,
    queryFn: ({ pageParam }) => Notifications_APIs.list(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage.pagination;
      if (!pagination) return undefined;
      return pagination.current_page < pagination.last_page
        ? pagination.current_page + 1
        : undefined;
    },
    enabled,
  });

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: UNREAD_KEY });
    void queryClient.invalidateQueries({ queryKey: LIST_KEY });
  }, [queryClient]);

  const markReadMutation = useMutation({
    mutationFn: (id: string) => Notifications_APIs.markRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: LIST_KEY });
      await queryClient.cancelQueries({ queryKey: UNREAD_KEY });

      const previousUnread = queryClient.getQueryData<{ count: number }>(
        UNREAD_KEY,
      );

      queryClient.setQueryData<{ count: number }>(UNREAD_KEY, (old) => ({
        count: Math.max(0, (old?.count ?? 0) - 1),
      }));

      queryClient.setQueriesData(
        { queryKey: LIST_KEY },
        (old: { pages: { items: AppNotification[] }[] } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((item) =>
                item.id === id
                  ? { ...item, read_at: new Date().toISOString() }
                  : item,
              ),
            })),
          };
        },
      );

      return { previousUnread };
    },
    onError: (_err, _id, context) => {
      if (context?.previousUnread) {
        queryClient.setQueryData(UNREAD_KEY, context.previousUnread);
      }
    },
    onSettled: invalidate,
  });

  const markAllReadMutation = useMutation({
    mutationFn: Notifications_APIs.markAllRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: LIST_KEY });
      queryClient.setQueryData(UNREAD_KEY, { count: 0 });
      queryClient.setQueriesData(
        { queryKey: LIST_KEY },
        (old: { pages: { items: AppNotification[] }[] } | undefined) => {
          if (!old) return old;
          const now = new Date().toISOString();
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((item) => ({
                ...item,
                read_at: item.read_at ?? now,
              })),
            })),
          };
        },
      );
    },
    onSettled: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (notification: AppNotification) =>
      Notifications_APIs.delete(notification.id),
    onMutate: async (notification) => {
      await queryClient.cancelQueries({ queryKey: LIST_KEY });
      if (notification.read_at == null) {
        queryClient.setQueryData<{ count: number }>(UNREAD_KEY, (old) => ({
          count: Math.max(0, (old?.count ?? 0) - 1),
        }));
      }
      queryClient.setQueriesData(
        { queryKey: LIST_KEY },
        (old: { pages: { items: AppNotification[] }[] } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.filter((item) => item.id !== notification.id),
            })),
          };
        },
      );
    },
    onSettled: invalidate,
  });

  const clearAllMutation = useMutation({
    mutationFn: Notifications_APIs.clearAll,
    onMutate: async () => {
      queryClient.setQueryData(UNREAD_KEY, { count: 0 });
      queryClient.setQueriesData(
        { queryKey: LIST_KEY },
        (old: { pages: { items: AppNotification[] }[] } | undefined) => {
          if (!old) return old;
          return { ...old, pages: [{ items: [] }] };
        },
      );
    },
    onSettled: invalidate,
  });

  const notifications =
    listQuery.data?.pages.flatMap((page) => page.items) ?? [];

  return {
    unreadCount: unreadQuery.data?.count ?? 0,
    notifications,
    isLoading: listQuery.isLoading || unreadQuery.isLoading,
    hasNextPage: listQuery.hasNextPage,
    isFetchingNextPage: listQuery.isFetchingNextPage,
    fetchNextPage: listQuery.fetchNextPage,
    markRead: markReadMutation.mutateAsync,
    markAllRead: markAllReadMutation.mutateAsync,
    deleteNotification: deleteMutation.mutateAsync,
    clearAll: clearAllMutation.mutateAsync,
    isMarkingRead: markReadMutation.isPending,
    isMarkingAllRead: markAllReadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isClearingAll: clearAllMutation.isPending,
    refetch: invalidate,
  };
}
