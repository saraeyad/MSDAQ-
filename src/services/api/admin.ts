import {
  getApiData,
  parsePaginatedListResponse,
  unwrapList,
} from "@/lib/api-data";
import type {
  AdminDashboard,
  AdminUsersListParams,
  ApiResponse,
  CreateAdminUserPayload,
  PaginatedListResult,
  PaginatedResponse,
  Role,
  UpdateAdminUserPayload,
  User,
} from "@/types";
import API from "./api.repository";

export const AdminUsers_APIs = {
  list: async (
    params: AdminUsersListParams = {},
  ): Promise<PaginatedListResult<User>> => {
    const response = await API.get<
      ApiResponse<User[] | PaginatedResponse<User>>
    >("/api/admin/users", { params });
    return parsePaginatedListResponse(response.data);
  },

  listAllForPicker: async (): Promise<User[]> => {
    const all: User[] = [];
    let page = 1;
    let lastPage = 1;

    do {
      const result = await AdminUsers_APIs.list({ page });
      all.push(...result.items);
      lastPage = result.pagination?.last_page ?? 1;
      page += 1;
    } while (page <= lastPage);

    return all;
  },

  show: async (id: number): Promise<User> => {
    const response = await API.get<ApiResponse<User>>(`/api/admin/users/${id}`);
    return getApiData(response);
  },

  create: async (data: CreateAdminUserPayload): Promise<User> => {
    const response = await API.post<ApiResponse<User>>("/api/admin/users", data);
    return getApiData(response);
  },

  update: async (id: number, data: UpdateAdminUserPayload): Promise<User> => {
    const response = await API.put<ApiResponse<User>>(
      `/api/admin/users/${id}`,
      data,
    );
    return getApiData(response);
  },

  delete: async (id: number): Promise<null> => {
    const response = await API.delete<ApiResponse<null>>(
      `/api/admin/users/${id}`,
    );
    return getApiData(response);
  },

  assignRole: async (
    id: number,
    role: string,
  ): Promise<{ user: User; roles: string[] }> => {
    const response = await API.post<
      ApiResponse<{ user: User; roles: string[] }>
    >(`/api/admin/users/${id}/assign-role`, { role });
    return getApiData(response);
  },

  revokeRole: async (
    id: number,
    role: string,
  ): Promise<{ user: User; roles: string[] }> => {
    const response = await API.post<
      ApiResponse<{ user: User; roles: string[] }>
    >(`/api/admin/users/${id}/revoke-role`, { role });
    return getApiData(response);
  },

  assignPermissions: async (
    id: number,
    permissions: string[],
  ): Promise<{ user: User; permissions: string[] }> => {
    const response = await API.post<
      ApiResponse<{ user: User; permissions: string[] }>
    >(`/api/admin/users/${id}/assign-permissions`, { permissions });
    return getApiData(response);
  },

  revokePermissions: async (
    id: number,
    permissions: string[],
  ): Promise<{ user: User; permissions: string[] }> => {
    const response = await API.post<
      ApiResponse<{ user: User; permissions: string[] }>
    >(`/api/admin/users/${id}/revoke-permissions`, { permissions });
    return getApiData(response);
  },
};

export const AdminRoles_APIs = {
  list: async (): Promise<Role[]> => {
    const response = await API.get<ApiResponse<Role[]>>("/api/admin/roles");
    return unwrapList<Role>(getApiData(response));
  },

  permissions: async (): Promise<string[]> => {
    const response = await API.get<ApiResponse<string[]>>(
      "/api/admin/permissions",
    );
    const data = getApiData(response);
    return Array.isArray(data) ? data : [];
  },

  create: async (data: {
    name: string;
    permissions?: string[];
  }): Promise<Role> => {
    const response = await API.post<ApiResponse<Role>>(
      "/api/admin/roles",
      data,
    );
    return getApiData(response);
  },

  update: async (id: number, data: { permissions: string[] }): Promise<Role> => {
    const response = await API.put<ApiResponse<Role>>(
      `/api/admin/roles/${id}`,
      data,
    );
    return getApiData(response);
  },

  delete: async (id: number): Promise<null> => {
    const response = await API.delete<ApiResponse<null>>(
      `/api/admin/roles/${id}`,
    );
    return getApiData(response);
  },
};

export const AdminDashboard_APIs = {
  get: async (days = 30): Promise<AdminDashboard> => {
    const clampedDays = Math.min(90, Math.max(7, days));
    const response = await API.get<ApiResponse<AdminDashboard>>(
      "/api/admin/dashboard",
      { params: { days: clampedDays } },
    );
    return getApiData(response);
  },
};

export const PublicSettings_APIs = {
  getPage: (key: string) =>
    API.get<ApiResponse<{ content: string }>>(`/api/pages/${key}`),
};
