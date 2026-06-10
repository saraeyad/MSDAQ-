import type { AxiosRequestConfig } from "axios";
import { Axios } from "../axios";

export default class API {
  static get<T>(url: string, config?: AxiosRequestConfig) {
    return Axios.get<T>(url, config);
  }

  static post<T>(url: string, body: unknown, config?: AxiosRequestConfig) {
    return Axios.post<T>(url, body, config);
  }

  static put<T>(url: string, body?: unknown, config?: AxiosRequestConfig) {
    return Axios.put<T>(url, body, config);
  }

  static patch<T>(url: string, body?: unknown, config?: AxiosRequestConfig) {
    return Axios.patch<T>(url, body, config);
  }

  static delete<T>(url: string, config?: AxiosRequestConfig) {
    return Axios.delete<T>(url, config);
  }

  static postFormData<T>(url: string, formData: FormData, config?: AxiosRequestConfig) {
    return Axios.post<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        "Content-Type": "multipart/form-data",
      },
    });
  }

  static putFormData<T>(url: string, formData: FormData, config?: AxiosRequestConfig) {
    // PHP/Laravel does not parse multipart bodies on PUT; spoof via POST + _method.
    formData.append("_method", "PUT");
    return Axios.post<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        "Content-Type": "multipart/form-data",
      },
    });
  }
}
