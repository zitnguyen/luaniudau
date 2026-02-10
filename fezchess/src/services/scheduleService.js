import axiosClient from "../api/axiosClient";

const scheduleService = {
  async getByStudentId(studentId) {
    try {
      // axiosClient TRẢ VỀ DATA TRỰC TIẾP
      const data = await axiosClient.get(`/schedules/student/${studentId}`);
      return data; // có thể là null hoặc object
    } catch (err) {
      console.warn("No schedule yet");
      return null;
    }
  },

  async upsertByStudentId(studentId, payload) {
    return axiosClient.put(`/schedules/student/${studentId}`, payload);
  },

  async deleteByStudentId(studentId) {
    return axiosClient.delete(`/schedules/student/${studentId}`);
  },
};

export default scheduleService;
