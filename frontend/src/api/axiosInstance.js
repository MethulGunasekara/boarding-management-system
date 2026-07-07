import axios from 'axios';

// Create a custom Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// REQUEST INTERCEPTOR: Automatically attach the JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('bms_user');
    if (storedUser) {
      const { token } = JSON.parse(storedUser);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR: Handle 401 Token Expiry globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Session expired or unauthorized. Logging out.');
      localStorage.removeItem('bms_user');
      window.location.href = '/'; // Kick user back to login
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;