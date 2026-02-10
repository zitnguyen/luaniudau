import axiosClient from '../api/axiosClient';

const teachingLogService = {
  create: (data) => {
    return axiosClient.post('/teaching-logs', data);
  },
  getMyLogs: (params) => {
    return axiosClient.get('/teaching-logs/my-logs', { params });
  },
  update: (id, data) => {
    return axiosClient.put(`/teaching-logs/${id}`, data);
  },
  delete: (id) => {
    return axiosClient.delete(`/teaching-logs/${id}`);
  }
};

export default teachingLogService;
