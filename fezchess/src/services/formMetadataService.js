import axiosClient from "../api/axiosClient";

const formMetadataService = {
  getFormConfig: async (formId, mode = "create") => {
    return axiosClient.get(`/form-metadata/${formId}`, { params: { mode } });
  },
};

export default formMetadataService;
