import axiosClient from '../api/axiosClient';

const postService = {
  // Public
  getPublishedPosts: async (params) => {
    // Endpoint: /api/posts/public (assuming this exists or just /posts with filter)
    // Checking server.js -> postRoutes -> router.get("/", postController.getAllPosts)
    // We should probably filter by isPublished=true in query if controller supports it,
    // or use a specific public endpoint if available.
    // Based on previous analysis, we likely use /posts
    return await axiosClient.get('/posts', { params: { ...params, isPublished: true } });
  },

  getPostBySlug: async (slug) => {
    return await axiosClient.get(`/posts/${slug}`);
  },

  // Admin / Protected
  getAllPosts: async () => {
    return await axiosClient.get('/posts');
  },

  createPost: async (postData) => {
    return await axiosClient.post('/posts', postData);
  },

  updatePost: async (id, postData) => {
    return await axiosClient.put(`/posts/${id}`, postData);
  },

  deletePost: async (id) => {
    return await axiosClient.delete(`/posts/${id}`);
  }
};

export default postService;
