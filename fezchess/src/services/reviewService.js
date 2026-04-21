import axiosClient from "../api/axiosClient";

const reviewService = {
  getByCourseId: (courseId) => axiosClient.get(`/reviews/course/${courseId}`),
  create: (payload) => axiosClient.post("/reviews", payload),
  remove: (id) => axiosClient.delete(`/reviews/${id}`),
};

export default reviewService;
