import axiosClient from "../api/axiosClient";

const userService = {
  getAll: (params) => axiosClient.get("/users", { params }),
  getOnlineUsers: () => axiosClient.get("/users/online"),
  getActivityStatuses: () => axiosClient.get("/users/activity-status"),
};

export default userService;
