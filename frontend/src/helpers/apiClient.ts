import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import constants from "../constants";

function getAuthorizationHeaders(): Record<string, string> {
  const accessToken = localStorage.getItem(constants.ACCESS_TOKEN);

  if (accessToken) {
    return {
      Authorization: `Bearer ${accessToken}`,
    };
  }
  return {};
}

function clearSessionAndRedirect() {
  sessionStorage.removeItem('session_user');
  localStorage.removeItem(constants.ACCESS_TOKEN);
  window.location.href = '/login';
}

function createClient() {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      ...getAuthorizationHeaders(),
    },
  });

  // ── Response interceptor ──────────────────────────────────────
  // Runs on EVERY response before it reaches any screen.
  // Success → check for new token and pass it through.
  // 401     → token expired, clear everything and send to /login.
  client.interceptors.response.use(
    (res: AxiosResponse) => {
      const newToken = res.headers['x-access-token'];
      if (newToken) {
        localStorage.setItem(constants.ACCESS_TOKEN, newToken);
      }
      return res;
    },
    (error) => {
      const isLoginRoute = error.config?.url?.includes('/login');

      if (error.response?.status === 401 && !isLoginRoute) {
        clearSessionAndRedirect();
      }
      return Promise.reject(error);
    }
  );

  return client;
}

function createApiClient() {
  return {
    get<T = unknown>(url: string, config?: AxiosRequestConfig) {
      return createClient().get<T>(url, config);
    },
    post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
      return createClient().post<T>(url, data, config);
    },
    put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
      return createClient().put<T>(url, data, config);
    },
    patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
      return createClient().patch<T>(url, data, config);
    },
    delete<T = unknown>(url: string, config?: AxiosRequestConfig) {
      return createClient().delete<T>(url, config);
    },
  };
}

export default createApiClient();