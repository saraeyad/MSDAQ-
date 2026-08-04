import { getApiData, parsePaginatedListResponse } from "@/lib/api-data";
import type {
  ApiResponse,
  AppNotification,
  PaginatedListResult,
  PaginatedResponse,
  UnreadNotificationsCount,
} from "@/types";
import API from "./api.repository";

export const Notifications_APIs = {
  list: async (page = 1): Promise<PaginatedListResult<AppNotification>> => {
    const response = await API.get<
      ApiResponse<AppNotification[] | PaginatedResponse<AppNotification>>
    >("/api/notifications", { params: { page } });
    return parsePaginatedListResponse(response.data);
  },

  unreadCount: async (): Promise<UnreadNotificationsCount> => {
    const response = await API.get<ApiResponse<UnreadNotificationsCount>>(
      "/api/notifications/unread",
    );
    return getApiData(response);
  },

  markRead: async (id: string): Promise<null> => {
    const response = await API.post<ApiResponse<null>>(
      `/api/notifications/${id}/read`,
      {},
    );
    return getApiData(response);
  },

  markAllRead: async (): Promise<null> => {
    const response = await API.post<ApiResponse<null>>(
      "/api/notifications/read-all",
      {},
    );
    return getApiData(response);
  },

  delete: async (id: string): Promise<null> => {
    const response = await API.delete<ApiResponse<null>>(
      `/api/notifications/${id}`,
    );
    return getApiData(response);
  },

  clearAll: async (): Promise<null> => {
    const response = await API.delete<ApiResponse<null>>(
      "/api/notifications/clear-all",
    );
    return getApiData(response);
  },
};
