import {
  getApiData,
  parsePaginatedListResponse,
  unwrapList,
} from "@/lib/api";
import type {
  AdminAnalytics,
  AdminAnalyticsRange,
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

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function pickMetric(row: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
}

function parseAdminAnalyticsPayload(payload: unknown): AdminAnalytics {
  const root = asRecord(payload);
  if (!root) {
    throw new Error("تعذّر قراءة تحليلات الموقع");
  }

  if (root.success === false || root.error === true) {
    throw new Error(
      typeof root.message === "string" && root.message.trim()
        ? root.message
        : "تعذّر تحميل تحليلات الموقع",
    );
  }

  const nested = asRecord(root.data);
  const inner =
    nested &&
    ("realtime" in nested ||
      "summary" in nested ||
      "top_pages" in nested ||
      "referrers" in nested)
      ? nested
      : root;

  const summaryRow = asRecord(inner.summary) ?? asRecord(inner.today) ?? {};

  return {
    realtime: pickMetric(inner, ["realtime"]),
    range: typeof inner.range === "string" ? inner.range : undefined,
    summary: {
      visitors: pickMetric(summaryRow, ["visitors", "users"]),
      pageviews: pickMetric(summaryRow, ["pageviews", "views"]),
      sessions: pickMetric(summaryRow, ["sessions"]),
      avg_session_duration_secs: pickMetric(summaryRow, [
        "avg_session_duration_secs",
        "averageSessionDuration",
      ]),
    },
    top_pages: Array.isArray(inner.top_pages) ? inner.top_pages : [],
    referrers: Array.isArray(inner.referrers) ? inner.referrers : [],
    devices: Array.isArray(inner.devices) ? inner.devices : [],
    countries: Array.isArray(inner.countries) ? inner.countries : [],
  };
}

export const AdminAnalytics_APIs = {
  get: async (
    range: AdminAnalyticsRange = "today",
  ): Promise<AdminAnalytics> => {
    const response = await API.get<ApiResponse<AdminAnalytics> | AdminAnalytics>(
      "/api/platform-feedback/analytics",
      { params: range === "today" ? undefined : { range } },
    );
    return parseAdminAnalyticsPayload(response.data);
  },
};
