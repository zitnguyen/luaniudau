import axiosClient from "../api/axiosClient";

const testimonialService = {
  getPublic: () => axiosClient.get("/testimonials/public"),
  getAll: () => axiosClient.get("/testimonials"),
  getById: (id) => axiosClient.get(`/testimonials/${id}`),
  create: (payload) => axiosClient.post("/testimonials", payload),
  update: (id, payload) => axiosClient.put(`/testimonials/${id}`, payload),
  remove: (id) => axiosClient.delete(`/testimonials/${id}`),
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await axiosClient.post("/upload/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response?.url || "";
  },
};

export default testimonialService;
