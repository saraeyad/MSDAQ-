import axios from "axios";
import { setupRequestInterceptor } from "./interceptors/request.interceptor";
import { setupResponseInterceptor } from "./interceptors/response.interceptor";

const DEFAULT_API_URL = "https://misdaq-production-1ff3.up.railway.app";

/** In dev, use the Vite proxy (same origin) unless VITE_HOST_API overrides. */
const baseURL =
  import.meta.env.VITE_HOST_API ||
  (import.meta.env.DEV ? "" : DEFAULT_API_URL);

if (!import.meta.env.VITE_HOST_API && import.meta.env.DEV) {
  console.info(
    "API requests use the Vite proxy (/api, /storage). Set VITE_HOST_API to call a remote host directly.",
  );
}

const AxiosInstance = axios.create({ baseURL });

setupRequestInterceptor(AxiosInstance);
setupResponseInterceptor(AxiosInstance);

export { AxiosInstance as Axios };
