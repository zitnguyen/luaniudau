import axiosClient from "../api/axiosClient";

const teacherService = {
  getAll: (params) => {
    return axiosClient.get("/users/teachers", { params });
  },
  getPublicById: (id) => {
    return axiosClient.get(`/users/teachers/${id}`);
  },
  getById: (id) => {
    return axiosClient.get(`/users/${id}`);
  },
  create: (data) => {
    return axiosClient.post("/users", { ...data, role: "Teacher" });
  },
  update: (id, data) => {
    return axiosClient.put(`/users/${id}`, data);
  },
  delete: (id) => {
    return axiosClient.delete(`/users/${id}`);
  },
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return axiosClient.post("/upload/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default teacherService;
