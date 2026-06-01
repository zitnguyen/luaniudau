import axiosClient from "../api/axiosClient";

const parentService = {
  getAll: async () => {
    return await axiosClient.get("/parents");
  },
  getById: async (id) => {
    return await axiosClient.get(`/parents/${id}`);
  },
  create: async (data) => {
    return await axiosClient.post("/parents", data);
  },
  update: async (id, data) => {
    return await axiosClient.put(`/parents/${id}`, data);
  },
  delete: async (id) => {
    return await axiosClient.delete(`/parents/${id}`);
  },
  getStudents: async (id) => {
    return await axiosClient.get(`/parents/${id}/students`);
  },
  // Admin: xem mật khẩu hiện tại (plain text từ server)
  getPassword: async (id) => {
    return await axiosClient.get(`/parents/${id}/password`);
  },
  // Admin: đặt lại mật khẩu mà không cần mật khẩu cũ
  resetPassword: async (id, newPassword) => {
    return await axiosClient.put(`/parents/${id}/reset-password`, { newPassword });
  },
};

export default parentService;
