import { getApiData, unwrapList } from "@/lib/api-data";
import type {
  ApiResponse,
  CalendarTask,
  CalendarTaskListQuery,
  CalendarDateRange,
  CalendarMovePayload,
  CreateCalendarTaskPayload,
  TaskOccurrencePayload,
  UpdateCalendarTaskPayload,
} from "@/types";
import API from "./api.repository";

export const CalendarTasks_APIs = {
  list: async (params?: CalendarTaskListQuery): Promise<CalendarTask[]> => {
    const response = await API.get<ApiResponse<CalendarTask[]>>("/api/tasks", {
      params,
    });
    return unwrapList(getApiData(response));
  },

  get: async (id: number | string): Promise<CalendarTask> => {
    const response = await API.get<ApiResponse<CalendarTask>>(`/api/tasks/${id}`);
    return getApiData(response);
  },

  create: async (data: CreateCalendarTaskPayload): Promise<CalendarTask> => {
    const response = await API.post<ApiResponse<CalendarTask>>("/api/tasks", data);
    return getApiData(response);
  },

  update: async (
    id: number | string,
    data: UpdateCalendarTaskPayload,
  ): Promise<CalendarTask> => {
    const response = await API.put<ApiResponse<CalendarTask>>(
      `/api/tasks/${id}`,
      data,
    );
    return getApiData(response);
  },

  delete: async (id: number | string): Promise<null> => {
    const response = await API.delete<ApiResponse<null>>(`/api/tasks/${id}`);
    return getApiData(response);
  },

  complete: async (
    id: number | string,
    data: TaskOccurrencePayload,
  ): Promise<null> => {
    const response = await API.post<ApiResponse<null>>(
      `/api/tasks/${id}/complete`,
      data,
    );
    return getApiData(response);
  },

  reopen: async (
    id: number | string,
    data: TaskOccurrencePayload,
  ): Promise<null> => {
    const response = await API.post<ApiResponse<null>>(
      `/api/tasks/${id}/reopen`,
      data,
    );
    return getApiData(response);
  },

  occurrences: async (
    id: number | string,
    params: CalendarDateRange,
  ): Promise<CalendarTask[]> => {
    const response = await API.get<ApiResponse<CalendarTask[]>>(
      `/api/tasks/${id}/occurrences`,
      { params },
    );
    return unwrapList(getApiData(response));
  },

  move: async (
    id: number | string,
    data: CalendarMovePayload,
  ): Promise<CalendarTask> => {
    const response = await API.post<ApiResponse<CalendarTask>>(
      `/api/tasks/${id}/move`,
      data,
    );
    return getApiData(response);
  },
};
