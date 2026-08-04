import { getApiData, unwrapList } from "@/lib/api-data";
import type { ApiResponse, CalendarFeedItem } from "@/types";
import API from "./api.repository";

export const Calendar_APIs = {
  list: async (params: {
    start: string;
    end: string;
  }): Promise<CalendarFeedItem[]> => {
    const response = await API.get<ApiResponse<CalendarFeedItem[]>>(
      "/api/calendar",
      { params },
    );
    return unwrapList(getApiData(response));
  },
};
