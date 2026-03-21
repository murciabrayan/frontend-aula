import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { API_BASE_URL } from "@/config/api";

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const AUTH_CHANGE_EVENT = "auth-change";

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, "");
const defaultBaseUrl = normalizeBaseUrl(API_BASE_URL || "http://127.0.0.1:8000");

let refreshPromise: Promise<string | null> | null = null;
let refreshOrigin = "";

const api = axios.create({
  baseURL: defaultBaseUrl,
});

const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
const AUTH_EXEMPT_PATHS = [
  "/api/token/",
  "/api/token/refresh/",
  "/api/auth/google/",
  "/api/password-reset/",
];

const getOriginFromUrl = (value?: string) => {
  if (!value) return null;

  try {
    return new URL(value, window.location.origin).origin;
  } catch {
    return null;
  }
};

const getRequestBaseUrl = (config?: RetriableRequestConfig) => {
  const fromBase = getOriginFromUrl(config?.baseURL);
  if (fromBase) return fromBase;

  const fromUrl = getOriginFromUrl(config?.url);
  if (fromUrl && /^https?:/i.test(config?.url || "")) return fromUrl;

  return getOriginFromUrl(defaultBaseUrl) || defaultBaseUrl;
};

const getRequestPath = (config?: RetriableRequestConfig) => {
  if (!config?.url) return "";

  try {
    const resolvedUrl = new URL(config.url, config.baseURL || defaultBaseUrl);
    return resolvedUrl.pathname;
  } catch {
    return config.url;
  }
};

const isAuthExemptRequest = (config?: RetriableRequestConfig) => {
  const path = getRequestPath(config);

  return AUTH_EXEMPT_PATHS.some((authPath) => path.startsWith(authPath));
};

const notifyAuthChange = () => {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

const clearSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem("user");
  notifyAuthChange();
};

const setAuthorizationHeader = (
  headers: InternalAxiosRequestConfig["headers"],
  token: string
) => {
  if (!headers) return;

  if (headers instanceof AxiosHeaders) {
    headers.set("Authorization", `Bearer ${token}`);
    return;
  }

  (headers as Record<string, string>).Authorization = `Bearer ${token}`;
};

const deleteContentTypeForFormData = (
  config: InternalAxiosRequestConfig
) => {
  if (!(config.data instanceof FormData) || !config.headers) return;

  if (config.headers instanceof AxiosHeaders) {
    config.headers.delete("Content-Type");
    return;
  }

  delete (config.headers as Record<string, string>)["Content-Type"];
};

const attachRequestInterceptor = (client: AxiosInstance) => {
  client.interceptors.request.use(
    (config) => {
      deleteContentTypeForFormData(config);

      if (isAuthExemptRequest(config)) {
        return config;
      }

      const token = getAccessToken();
      if (token) {
        setAuthorizationHeader(config.headers, token);
      }

      return config;
    },
    (error) => Promise.reject(error)
  );
};

const refreshAccessToken = async (requestBaseUrl: string) => {
  const refresh = getRefreshToken();
  if (!refresh) {
    clearSession();
    return null;
  }

  if (!refreshPromise || refreshOrigin !== requestBaseUrl) {
    refreshOrigin = requestBaseUrl;
    refreshPromise = axios
      .post<{ access: string }>(`${requestBaseUrl}/api/token/refresh/`, { refresh })
      .then((response) => {
        const nextAccess = response.data.access;
        localStorage.setItem(ACCESS_TOKEN_KEY, nextAccess);
        return nextAccess;
      })
      .catch((error) => {
        clearSession();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
        refreshOrigin = "";
      });
  }

  return refreshPromise;
};

const isRefreshRequest = (config?: RetriableRequestConfig) =>
  Boolean(getRequestPath(config).includes("/api/token/refresh/"));

const attachResponseInterceptor = (client: AxiosInstance) => {
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetriableRequestConfig | undefined;
      const status = error.response?.status;

      if (
        !originalRequest ||
        status !== 401 ||
        originalRequest._retry ||
        isRefreshRequest(originalRequest) ||
        isAuthExemptRequest(originalRequest)
      ) {
        return Promise.reject(error);
      }

      try {
        originalRequest._retry = true;

        const nextAccess = await refreshAccessToken(getRequestBaseUrl(originalRequest));
        if (!nextAccess) {
          return Promise.reject(error);
        }

        setAuthorizationHeader(originalRequest.headers, nextAccess);
        return client(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
  );
};

attachRequestInterceptor(api);
attachRequestInterceptor(axios);
attachResponseInterceptor(api);
attachResponseInterceptor(axios);

export default api;
