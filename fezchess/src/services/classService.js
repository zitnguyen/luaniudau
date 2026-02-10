import axiosClient from '../api/axiosClient';

const classService = {
  // Get all classes
  getAll: (params) => {
    return axiosClient.get('/classes', { params });
  },
  
  // Get class by ID
  getById: (id) => {
    return axiosClient.get(`/classes/${id}`);
  },
  
  // Get classes for a specific teacher
  getByTeacher: (teacherId) => {
    return axiosClient.get(`/classes/teacher/${teacherId}`);
  },

  // Create new class
  create: (data) => {
    return axiosClient.post('/classes', data);
  },

  // Update class
  update: (id, data) => {
    return axiosClient.put(`/classes/${id}`, data);
  },

  // Delete class
  delete: (id) => {
    return axiosClient.delete(`/classes/${id}`);
  }
};

export default classService;
