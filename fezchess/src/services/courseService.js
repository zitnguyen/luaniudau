import axiosClient from '../api/axiosClient';

const courseService = {
  // Public
  getPublishedCourses: async (params) => {
    return await axiosClient.get('/courses', { params });
  },

  getCourseBySlug: async (slug) => {
    const data = await axiosClient.get(`/courses/${slug}`);
    // Backend returns course object with 'chapters' field
    // Frontend expects { course, curriculum }
    return {
        course: data,
        curriculum: data.chapters || []
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
      // Adjusted endpoint based on standard REST practices or existing routes
      return await axiosClient.get(`/courses/${id}`); 
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
  }
};

export default courseService;
