import axiosClient from '../api/axiosClient';

const assessmentService = {
  create: (data) => {
    return axiosClient.post('/assessments', data);
  },
  getByClass: (classId) => {
    return axiosClient.get(`/assessments/class/${classId}`);
  },
  getByStudent: (studentId) => {
    return axiosClient.get(`/assessments/student/${studentId}`);
  },
  update: (id, data) => {
    return axiosClient.put(`/assessments/${id}`, data);
  },
  delete: (id) => {
    return axiosClient.delete(`/assessments/${id}`);
  }
};

export default assessmentService;
