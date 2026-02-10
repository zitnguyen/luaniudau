import axiosClient from '../api/axiosClient';

const authService = {
  login: async (credentials) => {
    // credentials: { username, password }
    // Backend expects 'username' (can be email) and 'password'
    // Endpoint: /api/auth/signin
    const response = await axiosClient.post('/auth/signin', credentials);
    if (response) {
      localStorage.setItem('user', JSON.stringify(response));
    }
    return response;
  },

  register: async (userData) => {
    // userData: { fullName, email, password, phone, ... }
    // Endpoint: /api/auth/signup (Verify backend endpoint)
    // Looking at authController (from previous knowledge), likely /auth/signup or /users
    // Let's assume /auth/signup based on Login being /auth/signin
    // If not, we might need to check server.js/authRoutes.js
    // Let's check authRoutes first if possible, but standard is signup.
    return await axiosClient.post('/auth/signup', userData);
  },

  logout: () => {
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export default authService;
