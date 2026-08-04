import { ROUTES } from "@/router/routes";
import type { ApiResponse } from "@/types";
import type { AxiosError, AxiosInstance, AxiosResponse } from "axios";

const SUCCESS_STATUSES = new Set([200, 201, 202, 204]);
const UNAUTHORIZED_STATUS = 401;
const FORBIDDEN_STATUS = 403;
const AUTH_ATTEMPT_PATHS = ["/api/auth/login"];

const endSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setTimeout(() => {
    window.location.href = ROUTES.LOGIN;
  }, 500);
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
        endSession();
      }

      if (error.response?.status === FORBIDDEN_STATUS) {
        return Promise.reject(error);
      }

      return Promise.reject(error);
    },
  );
};
