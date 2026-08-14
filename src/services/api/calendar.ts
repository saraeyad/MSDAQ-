import { getApiData, unwrapList } from "@/lib/api-data";
import type { ApiResponse, CalendarFeedItem, CalendarFeedQuery } from "@/types";
import API from "./api.repository";

export const Calendar_APIs = {
  list: async (params: CalendarFeedQuery): Promise<CalendarFeedItem[]> => {
    const response = await API.get<ApiResponse<CalendarFeedItem[]>>(
      "/api/calendar",
      {
        params: {
          ...params,
          types: params.types?.join(","),
        },
      },
    );
    return unwrapList(getApiData(response));
  },
};
