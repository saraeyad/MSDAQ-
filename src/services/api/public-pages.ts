import type { ApiResponse } from "@/types";
import API from "./api.repository";

export const PublicSettings_APIs = {
  getPage: (key: string) =>
    API.get<ApiResponse<{ content: string }>>(`/api/pages/${key}`),
};
