import axiosClient from "../api/axiosClient";

const heroSettingService = {
  getPublic: () => axiosClient.get("/hero-settings/public"),
  getAdmin: () => axiosClient.get("/hero-settings"),
  update: (payload) => axiosClient.put("/hero-settings", payload),
  uploadMedia: async (file) => {
    const formData = new FormData();
    formData.append("media", file);
    const data = await axiosClient.post("/upload/hero-media", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};

export default heroSettingService;
