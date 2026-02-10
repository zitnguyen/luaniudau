import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add a request interceptor
axiosClient.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== "undefined") {
        try {
            const user = JSON.parse(userStr);
            // Backend returns { accessToken: "..." }
            if (user && user.accessToken) {
                config.headers.Authorization = `Bearer ${user.accessToken}`;
            }
        } catch (e) {
            console.error("Invalid user data in localStorage, clearing...", e);
            localStorage.removeItem('user');
        }
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosClient.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response.data;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default axiosClient;
