import axios from "axios";
import { setupRequestInterceptor } from "./interceptors/request.interceptor";
import { setupResponseInterceptor } from "./interceptors/response.interceptor";

import { apiBaseUrl } from "@/lib/api-origin";

if (!import.meta.env.VITE_HOST_API && import.meta.env.DEV) {
  console.info(
    "API requests use the Vite proxy (/api, /storage). Set VITE_HOST_API to call a remote host directly.",
  );
}

const baseURL = apiBaseUrl();

const AxiosInstance = axios.create({ baseURL });

setupRequestInterceptor(AxiosInstance);
setupResponseInterceptor(AxiosInstance);

export { AxiosInstance as Axios };
