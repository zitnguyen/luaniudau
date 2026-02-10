import axiosClient from '../api/axiosClient';

const enrollmentService = {
  getAll: (params) => {
    // params can be { classId: '...' } or { studentId: '...' }
    return axiosClient.get('/enrollments', { params });
  },
  create: (data) => {
    return axiosClient.post('/enrollments', data);
  },
  delete: (id) => {
    return axiosClient.delete(`/enrollments/${id}`);
  },
  update: (id, data) => {
    return axiosClient.put(`/enrollments/${id}`, data);
  }
};

export default enrollmentService;
