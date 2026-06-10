import axios from "axios";
import { setupRequestInterceptor } from "./interceptors/request.interceptor";
import { setupResponseInterceptor } from "./interceptors/response.interceptor";

const DEFAULT_API_URL = "https://misdaq-production.up.railway.app";

const baseURL = import.meta.env.VITE_HOST_API || DEFAULT_API_URL;

if (!import.meta.env.VITE_HOST_API && import.meta.env.DEV) {
  console.warn(
    "VITE_HOST_API is not set. Falling back to",
    DEFAULT_API_URL,
    "— restart the dev server after editing .env.",
  );
}

const AxiosInstance = axios.create({ baseURL });

setupRequestInterceptor(AxiosInstance);
setupResponseInterceptor(AxiosInstance);

export { AxiosInstance as Axios };
