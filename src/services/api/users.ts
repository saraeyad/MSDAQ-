import { parsePaginatedListResponse } from "@/lib/api-data";
import type {
  ApiResponse,
  PaginatedListResult,
  PaginatedResponse,
  UserPickerItem,
} from "@/types";
import API from "./api.repository";

export const Users_APIs = {
  search: async (
    search: string,
    page = 1,
  ): Promise<PaginatedListResult<UserPickerItem>> => {
    const response = await API.get<
      ApiResponse<UserPickerItem[] | PaginatedResponse<UserPickerItem>>
    >("/api/users", { params: { search: search.trim() || undefined, page } });
    return parsePaginatedListResponse(response.data);
  },
};
