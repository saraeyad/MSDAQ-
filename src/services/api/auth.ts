import type { AuthUser } from "@/context/types";
import type { ApiResponse } from "../types/api";
import type {
  AuthData,
  GoogleLoginPayload,
  LoginPayload,
  RegisterPayload,
} from "../types/auth";
import API from "./api.repository";

function toFormData(data: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    formData.append(key, value);
  }
  return formData;
}

export const clearAuthSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const Auth_APIs = {
  login: async (data: LoginPayload) => {
    return API.post<ApiResponse<AuthData>>(
      "/api/auth/login",
      toFormData(data),
    );
  },

  register: async (data: RegisterPayload) => {
    return API.post<ApiResponse<AuthData>>(
      "/api/auth/register",
      toFormData(data),
    );
  },

  googleLogin: async (data: GoogleLoginPayload) => {
    return API.post<ApiResponse<AuthData>>(
      "/api/auth/google",
      toFormData({ token: data.token }),
    );
  },

  me: async () => {
    return API.get<ApiResponse<AuthUser>>("/api/me");
  },

  logout: async () => {
    try {
      await API.post<ApiResponse<null>>("/api/logout", {});
    } catch {
      // Session may already be invalid; still clear client state.
    } finally {
      clearAuthSession();
    }
  },
};
