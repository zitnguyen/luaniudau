import axiosClient from "../api/axiosClient";

const unwrapData = (response) => {
  if (response && typeof response === "object" && "success" in response) {
    return response.data;
  }
  return response;
};

const teacherDashboardService = {
  getDashboard: async () => {
    const response = await axiosClient.get("/teacher/dashboard");
    return unwrapData(response) || {};
  },
  getClasses: async () => {
    const response = await axiosClient.get("/teacher/classes");
    return unwrapData(response) || [];
  },
  getStudents: async () => {
    const response = await axiosClient.get("/teacher/students");
    return unwrapData(response) || [];
  },
  getAttendance: async () => {
    const response = await axiosClient.get("/teacher/attendance");
    return unwrapData(response) || [];
  },
  getFinance: async () => {
    const response = await axiosClient.get("/teacher/finance");
    return unwrapData(response) || {};
  },
};

export default teacherDashboardService;
