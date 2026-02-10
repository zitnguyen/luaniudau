import axios from 'axios';

// Public API doesn't use the interceptor with Auth Token necessarily, 
// but our axiosClient might have it. 
// For public endpoints, we can use a separate instance or just use axios directly 
// or use the same client (it handles 401 but we are posting publicly).

const API_URL = 'http://localhost:5000/api'; // Or from ENV

const leadService = {
  create: async (data) => {
    const response = await axios.post(`${API_URL}/leads`, data);
    return response.data;
  },
  // Admin methods will use the authenticated client
};

export default leadService;
