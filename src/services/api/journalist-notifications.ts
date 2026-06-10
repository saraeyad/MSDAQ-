import type { ApiResponse } from "../types/api";
import API from "./api.repository";

export type JournalistNotification = {
  id: string;
  data: {
    source_name?: string;
    status?: string;
    article_id?: number;
    article_title?: string;
    message?: string;
  };
  read_at?: string | null;
  created_at: string;
};

export type JournalistNotificationsData = {
  notifications: JournalistNotification[];
  unread_count: number;
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
};

export type JournalistNotificationsResponse = ApiResponse<JournalistNotificationsData>;

const JournalistNotifications_APIs = {
  list: async () => {
    return API.get<JournalistNotificationsResponse>("/api/journalist/notifications");
  },
};

export default JournalistNotifications_APIs;
