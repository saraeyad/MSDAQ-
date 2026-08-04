import type { AuthUser } from "@/context/types";
import type { ApiResponse } from "@/types";
import API from "./api.repository";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthData {
  token: string;
  user: AuthUser;
}

/**
 * GET /api/me response shape (01 · Auth collection):
 * `{ user: { id, name, email, ... }, roles?: string[], permissions?: string[] }`.
 * Top-level roles/permissions are merged onto the flat AuthUser by normalizeMeUser.
 */
export interface MeData {
  user: AuthUser;
  roles?: string[];
  permissions?: string[];
}

export const Auth_APIs = {
  login: (data: LoginPayload) =>
    API.post<ApiResponse<AuthData>>("/api/auth/login", data),

  me: () => API.get<ApiResponse<MeData>>("/api/me"),

  logout: async () => {
    try {
      await API.post<ApiResponse<null>>("/api/logout", {});
    } catch {
      // Session may already be invalid.
    }
  },
};
