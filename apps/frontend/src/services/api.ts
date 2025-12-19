import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "backend-production-9b00.up.railway.app/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Inject Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - Clear auth and redirect
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/auth/login";
      } else if (status === 403) {
        // Forbidden - SaaS Suspension or Access Denied
        // Dispatch a custom event for the UI to show a modal
        const event = new CustomEvent("api:forbidden", { detail: data });
        window.dispatchEvent(event);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
