import { errorToast } from "@/components/sonner-toast";
import { ROUTES } from "@/router/routes";
import { clearAuthSession } from "@/services/api/auth";
import type { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { t } from "i18next";

const SUCCESS_STATUSES = new Set([200, 201, 202, 204]);
const UNAUTHORIZED_STATUS = 401;
const FORBIDDEN_STATUS = 403;
const AUTH_ATTEMPT_PATHS = ["/api/auth/login", "/api/auth/register", "/api/auth/google"];

const endSession = (msg: string) => {
  errorToast(msg);
  clearAuthSession();
  setTimeout(() => {
    window.location.href = ROUTES.LOGIN;
  }, 1000);
};

export const setupResponseInterceptor = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      if (!SUCCESS_STATUSES.has(response.status)) {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
      return response;
    },
    (error: AxiosError<{ message?: string }>) => {
      const requestPath = error.config?.url ?? "";
      const isAuthAttempt = AUTH_ATTEMPT_PATHS.some((path) =>
        requestPath.includes(path),
      );

      if (error.response?.status === UNAUTHORIZED_STATUS && !isAuthAttempt) {
        endSession(t("auth.notAuthenticated"));
      }

      const isJournalistRequest = requestPath.includes("/api/journalist-requests");

      if (error.response?.status === FORBIDDEN_STATUS && !isJournalistRequest) {
        endSession(t("auth.newSessionDetected"));
      }

      return Promise.reject(error);
    }
  );
};
