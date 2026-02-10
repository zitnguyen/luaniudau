import axiosClient from '../api/axiosClient';

const teacherService = {
  getAll: (params) => {
    // Assuming backend supports filtering by role via query params
    return axiosClient.get('/users', { params: { role: 'Teacher', ...params } });
  },
  getById: (id) => {
    return axiosClient.get(`/users/${id}`);
  },
  create: (data) => {
    return axiosClient.post('/users', { ...data, role: 'Teacher' });
  },
  update: (id, data) => {
    return axiosClient.put(`/users/${id}`, data);
  },
  delete: (id) => {
    return axiosClient.delete(`/users/${id}`);
  },
};

export default teacherService;
