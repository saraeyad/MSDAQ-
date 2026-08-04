import type { AxiosInstance } from "axios";

export const setupRequestInterceptor = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    config.headers["Accept"] = "application/json";
    config.headers["Accept-Language"] = "ar";
    config.headers["Authorization"] = token ? `Bearer ${token}` : "";

    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] ??= "application/json";
    } else {
      delete config.headers["Content-Type"];
    }

    return config;
  });
};
