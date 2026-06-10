import type { AuthUser } from "@/context/types";
import type { ApiResponse } from "./api";

export type AuthData = {
  token: string;
  user: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
};

export type GoogleLoginPayload = {
  token: string;
};

function normalizeRole(role: AuthUser["role"]): AuthUser["role"] {
  if (!role) return "normal_user";
  const trimmed = String(role).trim();
  if (trimmed === "admin" || trimmed === "journalist" || trimmed === "normal_user") {
    return trimmed;
  }
  return role;
}

export function normalizeAuthUser(user: AuthUser): AuthUser {
  return {
    ...user,
    role: normalizeRole(user.role),
  };
}

export function parseAuthResponse(response: ApiResponse<AuthData>): AuthData {
  if (response.error || !response.data?.token) {
    throw new Error(response.message || "Authentication failed");
  }

  return {
    ...response.data,
    user: normalizeAuthUser(response.data.user),
  };
}

type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string[]>;
};

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong"
): string {
  const axiosError = error as {
    response?: { status?: number; data?: ApiErrorBody };
    config?: { baseURL?: string; url?: string };
    message?: string;
  };

  if (axiosError.response?.status === 404) {
    const target = `${axiosError.config?.baseURL ?? ""}${axiosError.config?.url ?? ""}`;
    if (target.includes("localhost") || target.includes("127.0.0.1")) {
      return "API server not found. Restart the dev server so .env (VITE_HOST_API) is loaded.";
    }
  }

  const data = axiosError.response?.data;
  if (data?.message) return data.message;

  const firstFieldError = data?.errors
    ? Object.values(data.errors).flat().find(Boolean)
    : undefined;
  if (firstFieldError) return firstFieldError;

  return axiosError.message ?? fallback;
}

export function getAuthErrorMessage(
  error: unknown,
  translate: (key: string) => string,
  fallback: string,
): string {
  const apiMessage = getApiErrorMessage(error, fallback).toLowerCase();

  if (apiMessage.includes("email has already been taken")) {
    return translate("auth.emailAlreadyTaken");
  }

  if (apiMessage.includes("invalid credentials")) {
    return translate("auth.invalidCredentials");
  }

  if (apiMessage.includes("google")) {
    return translate("auth.useGoogleInstead");
  }

  return getApiErrorMessage(error, fallback);
}
