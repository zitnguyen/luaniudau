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
};

export default parentService;
