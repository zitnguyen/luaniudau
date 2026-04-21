import axiosClient from "../api/axiosClient";

const normalizeResponseData = (response) => {
  if (!response) return null;
  if (response.data && typeof response.data === "object") return response.data;
  return response;
};

const settingsService = {
  get: async () => {
    const response = await axiosClient.get("/settings");
    return normalizeResponseData(response);
  },
  update: async (payload) => {
    const response = await axiosClient.patch("/settings", payload);
    return normalizeResponseData(response);
  },
  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append("logo", file);
    const response = await axiosClient.post("/upload/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const payload = normalizeResponseData(response);
    return payload?.url || payload?.data?.url || "";
  },
};

export default settingsService;
