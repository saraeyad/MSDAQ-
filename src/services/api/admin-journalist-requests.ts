import type {
  JournalistRequestActionResponse,
  JournalistRequestDetailResponse,
  JournalistRequestListParams,
  JournalistRequestsListResponse,
  RejectJournalistRequestPayload,
} from "../types/admin-journalist-requests";
import API from "./api.repository";

const AdminJournalistRequests_APIs = {
  list: async (params?: JournalistRequestListParams) => {
    return API.get<JournalistRequestsListResponse>("/api/admin/journalist-requests", {
      params,
    });
  },

  show: async (id: number | string) => {
    return API.get<JournalistRequestDetailResponse>(
      `/api/admin/journalist-requests/${id}`,
    );
  },

  approve: async (id: number | string) => {
    return API.put<JournalistRequestActionResponse>(
      `/api/admin/journalist-requests/${id}/approve`,
    );
  },

  reject: async (id: number | string, body: RejectJournalistRequestPayload) => {
    return API.put<JournalistRequestActionResponse>(
      `/api/admin/journalist-requests/${id}/reject`,
      body,
    );
  },
};

export default AdminJournalistRequests_APIs;
