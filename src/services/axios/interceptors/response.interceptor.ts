import { readSessionToken } from "@/lib/auth/session-token";
import { ROUTES } from "@/router/routes";
import type { ApiResponse } from "@/types";
import type { AxiosError, AxiosInstance, AxiosResponse } from "axios";

const SUCCESS_STATUSES = new Set([200, 201, 202, 204]);
const UNAUTHORIZED_STATUS = 401;
const FORBIDDEN_STATUS = 403;
const AUTH_ATTEMPT_PATHS = ["/api/auth/login"];
const STAFF_PATH = /^\/(newsroom|admin)(\/|$)/;

function requestBearer(error: AxiosError<ApiResponse<unknown>>): string | null {
  const headers = error.config?.headers;
  if (!headers) return null;
  const raw =
    typeof headers.get === "function"
      ? headers.get("Authorization")
      : (headers.Authorization ?? headers.authorization);
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string") return null;
  const token = value.replace(/^Bearer\s+/i, "").trim();
  return token || null;
}

const endSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  if (typeof window === "undefined") return;

  const path = window.location.pathname;
  // Public pages, including the landing page, stay put. Login is opened by hand.
  if (!STAFF_PATH.test(path)) return;

  window.location.assign(ROUTES.LOGIN);
};

export const setupResponseInterceptor = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      if (!SUCCESS_STATUSES.has(response.status)) {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
      return response;
    },
    (error: AxiosError<ApiResponse<unknown>>) => {
      const requestPath = error.config?.url ?? "";
      const isAuthAttempt = AUTH_ATTEMPT_PATHS.some((path) =>
        requestPath.includes(path),
      );

      if (error.response?.status === UNAUTHORIZED_STATUS && !isAuthAttempt) {
        const current = readSessionToken();
        const used = requestBearer(error);
        if (current && used === current) {
          endSession();
        }
      }

      if (error.response?.status === FORBIDDEN_STATUS) {
        return Promise.reject(error);
      }

      return Promise.reject(error);
    },
  );
};
