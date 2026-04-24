import axiosClient from "../api/axiosClient";
import authService from "./authService";
import { getRealtimeSocket } from "./realtimeSocket";

let mineCache = null;
let mineCacheAt = 0;
let mineInFlightPromise = null;
const MINE_CACHE_TTL_MS = 5000;
const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const clearMineCache = () => {
  mineCache = null;
  mineCacheAt = 0;
};

const notificationService = {
  create: (payload) => axiosClient.post("/notifications", payload),
  getMine: async ({ force = false } = {}) => {
    const now = Date.now();
    if (!force && mineCache && now - mineCacheAt < MINE_CACHE_TTL_MS) {
      return mineCache;
    }
    if (!force && mineInFlightPromise) {
      return mineInFlightPromise;
    }

    mineInFlightPromise = (async () => {
      try {
        const res = await axiosClient.get("/notifications");
        mineCache = res;
        mineCacheAt = Date.now();
        return res;
      } catch (error) {
        const status = error?.response?.status;
        // Handle temporary rate-limit by retrying once, then serving stale cache when available.
        if (status === 429) {
          try {
            await wait(1200);
            const retryRes = await axiosClient.get("/notifications");
            mineCache = retryRes;
            mineCacheAt = Date.now();
            return retryRes;
          } catch {
            if (mineCache) return mineCache;
          }
        }
        if (mineCache && (status === 429 || status >= 500)) {
          return mineCache;
        }
        throw error;
      } finally {
        mineInFlightPromise = null;
      }
    })();

    return mineInFlightPromise;
  },
  getById: (id) => axiosClient.get(`/notifications/${id}`),
  markRead: (id, isRead = true) =>
    axiosClient.patch(`/notifications/${id}/read`, { isRead }),
  subscribeRealtime: (handler) => {
    const accessToken = authService.getCurrentUser()?.accessToken;
    if (!accessToken || typeof handler !== "function") {
      return () => {};
    }
    const socket = getRealtimeSocket(accessToken);
    if (!socket) return () => {};

    const onNewNotification = (payload) => {
      clearMineCache();
      handler(payload);
    };

    socket.on("notification:new", onNewNotification);
    return () => {
      socket.off("notification:new", onNewNotification);
    };
  },
};

export default notificationService;
