import axiosClient from "../api/axiosClient";

const scheduleService = {
  async getAll() {
    try {
      const data = await axiosClient.get("/schedules");
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn("Failed to load schedules");
      return [];
    }
  },

};

export default scheduleService;
