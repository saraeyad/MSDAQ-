import { getApiData, unwrapList } from "@/lib/api-data";
import type {
  ApiResponse,
  CalendarEventRecord,
  CreateCalendarEventRecordPayload,
  UpdateCalendarEventRecordPayload,
} from "@/types";
import API from "./api.repository";

export const CalendarEvents_APIs = {
  list: async (): Promise<CalendarEventRecord[]> => {
    const response = await API.get<ApiResponse<CalendarEventRecord[]>>(
      "/api/events",
    );
    return unwrapList(getApiData(response));
  },

  get: async (id: number | string): Promise<CalendarEventRecord> => {
    const response = await API.get<ApiResponse<CalendarEventRecord>>(
      `/api/events/${id}`,
    );
    return getApiData(response);
  },

  create: async (
    data: CreateCalendarEventRecordPayload,
  ): Promise<CalendarEventRecord> => {
    const response = await API.post<ApiResponse<CalendarEventRecord>>(
      "/api/events",
      data,
    );
    return getApiData(response);
  },

  update: async (
    id: number | string,
    data: UpdateCalendarEventRecordPayload,
  ): Promise<CalendarEventRecord> => {
    const response = await API.put<ApiResponse<CalendarEventRecord>>(
      `/api/events/${id}`,
      data,
    );
    return getApiData(response);
  },

  delete: async (id: number | string): Promise<null> => {
    const response = await API.delete<ApiResponse<null>>(`/api/events/${id}`);
    return getApiData(response);
  },
};
