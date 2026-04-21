import axiosClient from "../api/axiosClient";

const userService = {
  getAll: (params) => axiosClient.get("/users", { params }),
};

export default userService;
