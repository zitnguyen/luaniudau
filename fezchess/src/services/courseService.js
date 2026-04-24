import axiosClient from '../api/axiosClient';

const courseService = {
  // Public
  getPublishedCourses: async (params) => {
    return await axiosClient.get('/courses', { params });
  },

  getCourseBySlug: async (slug) => {
    const data = await axiosClient.get(`/courses/${slug}`);
    return {
        course: data,
        curriculum: data.chapters || [],
        canViewContent: Boolean(data?.canViewContent),
    };
  },

  // Protected/Admin
  createCourse: async (courseData) => {
    return await axiosClient.post('/courses', courseData);
  },

  updateCourse: async (id, courseData) => {
    return await axiosClient.put(`/courses/${id}`, courseData);
  },

  getCourseById: async (id) => {
      return await axiosClient.get(`/courses/id/${id}`); 
  },
  getCourseAccess: async (id) => {
      try {
          return await axiosClient.get(`/courses/id/${id}/access`);
      } catch (error) {
          if (error?.response?.status === 404) {
              return await axiosClient.get(`/courses/${id}/access`);
          }
          throw error;
      }
  },
  setCourseAccess: async (id, userIds) => {
      try {
          return await axiosClient.put(`/courses/id/${id}/access`, { userIds });
      } catch (error) {
          if (error?.response?.status === 404) {
              return await axiosClient.put(`/courses/${id}/access`, { userIds });
          }
          throw error;
      }
  },

  // Chapters & Lessons
  addChapter: async (chapterData) => {
      return await axiosClient.post('/chapters', chapterData);
  },

  addLesson: async (lessonData) => {
      return await axiosClient.post('/lessons', lessonData);
  },

  getLessonById: async (id) => {
      return await axiosClient.get(`/lessons/${id}`);
  },
  getMyLessonChessProgress: async (lessonId) => {
      return await axiosClient.get(`/lessons/${lessonId}/chess-progress`);
  },
  saveMyLessonChessProgress: async (lessonId, payload) => {
      return await axiosClient.put(`/lessons/${lessonId}/chess-progress`, payload);
  },
  uploadImage: async (file) => {
      const formData = new FormData();
      formData.append("image", file);
      const data = await axiosClient.post("/upload/course-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
      });
      return data?.url;
  },
};

export default courseService;
