import axiosClient from '../api/axiosClient';

const attendanceService = {
  // Get attendance records (can filter by classId, date, studentId)
  getAll: (params) => {
    return axiosClient.get('/attendance', { params });
  },
  
  // Mark a student as present
  markPresent: (data) => {
    // data: { studentId, classId, date }
    return axiosClient.post('/attendance/present', data);
  },

  // Mark a student as absent
  markAbsent: (data) => {
    // data: { studentId, classId, date, reason? }
    return axiosClient.post('/attendance/absent', data);
  },

  // Update note for an attendance record
  updateNote: (id, note) => {
    return axiosClient.put(`/attendance/${id}/note`, { note });
  }
};

export default attendanceService;
