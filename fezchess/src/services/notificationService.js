import axiosClient from "../api/axiosClient";

const notificationService = {
  create: (payload) => axiosClient.post("/notifications", payload),
  getMine: () => axiosClient.get("/notifications"),
  getById: (id) => axiosClient.get(`/notifications/${id}`),
  markRead: (id, isRead = true) =>
    axiosClient.patch(`/notifications/${id}/read`, { isRead }),
};

export default notificationService;
