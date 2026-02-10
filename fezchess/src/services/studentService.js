import axiosClient from "../api/axiosClient";

const studentService = {
  getAll: (params) => {
    return axiosClient.get("/students", { params });
  },
  getById: (id) => {
    return axiosClient.get(`/students/${id}`);
  },
  create: (data) => {
    return axiosClient.post("/students/", data);
  },
  update: (id, data) => {
    return axiosClient.put(`/students/${id}`, data);
  },
  delete: (id) => {
    return axiosClient.delete(`/students/${id}`);
  },
  getByParentId: (parentId) => {
    return axiosClient.get(`/students/parent/${parentId}`);
  },
};

export default studentService;
