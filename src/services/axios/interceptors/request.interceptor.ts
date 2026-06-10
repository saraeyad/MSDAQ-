import type { AxiosInstance } from "axios";
import cookies from "js-cookie";

export const setupRequestInterceptor = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    const lang = cookies.get("i18next") || "ar";

    config.headers["Accept"] = "application/json";
    config.headers["Accept-Language"] = lang;
    config.headers["culture"] = lang;
    config.headers["Authorization"] = token ? `Bearer ${token}` : "";

    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] ??= "application/json";
    } else {
      delete config.headers["Content-Type"];
    }

    return config;
  });
};
