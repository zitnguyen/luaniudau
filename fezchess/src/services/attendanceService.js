import axiosClient from "../api/axiosClient";

const unwrapData = (response) => {
  if (response && typeof response === "object" && "success" in response) {
    return response.data;
  }
  return response;
};

const attendanceService = {
  /** Lấy điểm danh theo lớp + ngày (query date=YYYY-MM-DD) */
  getByClassAndDate: async (classId, date) => {
    const response = await axiosClient.get(`/attendance/class/${classId}`, {
      params: date ? { date } : {},
    });
    return unwrapData(response) || [];
  },

  getByStudentAndDate: async (studentId, date) => {
    const response = await axiosClient.get("/attendance", {
      params: { studentId, ...(date ? { date } : {}) },
    });
    return unwrapData(response) || [];
  },

  /** Tạo / cập nhật điểm danh (một bản ghi) */
  mark: async (payload) => {
    const response = await axiosClient.post("/attendance", payload);
    return unwrapData(response);
  },

  update: async (id, body) => {
    const response = await axiosClient.put(`/attendance/${id}`, body);
    return unwrapData(response);
  },
};

export default attendanceService;
