import axiosClient from "../api/axiosClient";

const normalize = (response) => response?.data || response || {};

const publicCmsService = {
  getPublic: async () => {
    const res = await axiosClient.get("/settings/public-cms/public");
    return normalize(res);
  },
  getAdmin: async () => {
    const res = await axiosClient.get("/settings/public-cms");
    return normalize(res);
  },
  update: async (publicCms) => {
    const res = await axiosClient.patch("/settings/public-cms", { publicCms });
    return normalize(res);
  },
  uploadMedia: async (file) => {
    const formData = new FormData();
    formData.append("media", file);
    const res = await axiosClient.post("/upload/public-cms-media", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return normalize(res)?.url || "";
  },
};

export default publicCmsService;
