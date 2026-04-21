import axiosClient from "../api/axiosClient";

const enrollmentService = {
  getAll: (params) => {
    return axiosClient.get("/enrollments", { params });
  },
  getById: (id) => {
    return axiosClient.get(`/enrollments/${id}`);
  },
  create: (data) => {
    return axiosClient.post("/enrollments", data);
  },
  delete: (id) => {
    return axiosClient.delete(`/enrollments/${id}`);
  },
  update: (id, data) => {
    return axiosClient.put(`/enrollments/${id}`, data);
  },
};

export default enrollmentService;
