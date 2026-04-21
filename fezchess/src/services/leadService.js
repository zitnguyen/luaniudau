import axiosClient from "../api/axiosClient";

const leadService = {
  create: async (data) => {
    return axiosClient.post("/leads", data);
  },
};

export default leadService;
