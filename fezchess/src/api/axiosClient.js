import axios from 'axios';

// VITE_API_URL in `.env` (e.g. http://localhost:5000/api). Falls back to `/api` so Vite dev proxy (vite.config.js) can reach the backend on port 5000.
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 15000,
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

let refreshPromise = null;

const parseJwtExp = (token) => {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded?.exp ? Number(decoded.exp) : null;
  } catch {
    return null;
  }
};

const shouldRefreshSoon = (token) => {
  if (!token) return true;
  const exp = parseJwtExp(token);
  if (!exp) return true;
  const nowSec = Math.floor(Date.now() / 1000);
  return exp - nowSec < 60; // Refresh if expires in < 60s
};

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post("/auth/refresh")
      .then((res) => {
        const newAccessToken = res?.data?.accessToken;
        if (!newAccessToken) throw new Error("No access token returned from refresh endpoint");
        const userStr = localStorage.getItem("user");
        if (userStr && userStr !== "undefined") {
          try {
            const user = JSON.parse(userStr);
            localStorage.setItem(
              "user",
              JSON.stringify({ ...user, accessToken: newAccessToken }),
            );
          } catch {
            // Keep silent: request flow can still continue with returned token.
          }
        }
        return newAccessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// Add a request interceptor
axiosClient.interceptors.request.use(
  async function (config) {
    // Do something before request is sent
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== "undefined") {
        try {
            const user = JSON.parse(userStr);
            // Backend returns { accessToken: "..." }
            if (user && user.accessToken) {
                const isAuthEndpoint = (config?.url || "").includes("/auth/");
                let accessToken = user.accessToken;
                if (!isAuthEndpoint && shouldRefreshSoon(accessToken)) {
                  try {
                    accessToken = await refreshAccessToken();
                  } catch (e) {
                    // Keep the old token here, response interceptor will handle hard failures.
                    accessToken = user.accessToken;
                  }
                }
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
        } catch (e) {
            console.error("Invalid user data in localStorage, skipping auth header...", e);
        }
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosClient.interceptors.response.use(
  function (response) {
    if (response.config.responseType === "blob") {
      return response;
    }
    return response.data;
  },
  async function (error) {
    const originalRequest = error?.config || {};
    const status = error?.response?.status;
    const requestUrl = String(originalRequest?.url || "");

    // Skip auto-refresh for auth endpoints to avoid loops.
    const isAuthEndpoint = (originalRequest?.url || "").includes("/auth/");

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Do NOT auto-logout here. Keep the current session client-side;
        // user will only be logged out when they explicitly click logout.
        return Promise.reject(refreshError);
      }
    }

    // Suppress noisy export-progress logs (UI already handles friendly messages).
    const isProgressExport = requestUrl.includes("/progress/export/");
    if (!(isProgressExport && status === 404)) {
      // Any status codes that falls outside the range of 2xx cause this function to trigger
      console.error('API Error:', error);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
