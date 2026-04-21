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
  getMyProfile: async () => {
    let me = null;
    try {
      me = await axiosClient.get("/users/me");
    } catch (error) {
      // Final fallback so settings page can still render basic info.
      const cachedUser = JSON.parse(localStorage.getItem("user") || "null");
      if (!cachedUser) throw error;
      me = cachedUser;
    }
    return {
      _id: me?._id || "",
      username: me?.username || "",
      email: me?.email || "",
      fullName: me?.fullName || "",
      phone: me?.phone || "",
      specialization: me?.specialization || "",
      experienceYears: me?.experienceYears ?? null,
      certificates: me?.certification || me?.certificates || "",
      avatarUrl: me?.avatarUrl || "",
      role: me?.role || "",
    };
  },
  updateMyProfile: (payload) => {
    return axiosClient.patch("/teacher/me", payload);
  },
  changeMyPassword: (payload) => {
    return axiosClient.post("/teacher/me/change-password", payload);
  },
};

export default teacherService;
