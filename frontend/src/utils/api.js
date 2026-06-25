import axios from 'axios';

// 1. Create a base instance of Axios
const api = axios.create({
  baseURL: 'http://localhost:5000', // Points directly to our Node.js server
});

// 2. Add the Interceptor
api.interceptors.request.use(
  (config) => {
    // Check local storage for the logged-in user's data
    const userInfo = localStorage.getItem('userInfo');
    
    if (userInfo) {
      const parsedInfo = JSON.parse(userInfo);
      // If a token exists, attach it to the standard Bearer Authorization header
      if (parsedInfo.token) {
        config.headers.Authorization = `Bearer ${parsedInfo.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;