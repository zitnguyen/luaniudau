import axiosClient from '../api/axiosClient';

const postService = {
  normalizeListResponse: (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.posts)) return response.posts;
    return [];
  },

  // Public
  getPublishedPosts: async (params) => {
    const data = await axiosClient.get('/posts', { params: { ...params, isPublished: true } });
    return postService.normalizeListResponse(data);
  },

  getPostBySlug: async (slug) => {
    return await axiosClient.get(`/posts/${slug}`);
  },

  // Admin / Protected
  getAllPosts: async () => {
    const data = await axiosClient.get('/posts');
    return postService.normalizeListResponse(data);
  },

  createPost: async (postData) => {
    return await axiosClient.post('/posts', postData);
  },

  updatePost: async (id, postData) => {
    return await axiosClient.put(`/posts/${id}`, postData);
  },

  deletePost: async (id) => {
    return await axiosClient.delete(`/posts/${id}`);
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("media", file);
    const data = await axiosClient.post("/upload/public-cms-media", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data?.url || "";
  },
};

export default postService;
