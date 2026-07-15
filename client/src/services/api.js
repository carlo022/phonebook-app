import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 35000, // 35 seconds for email operations
});

// Intercept requests to attach the Bearer token and normalize paths
api.interceptors.request.use(
  (config) => {
    try {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch (error) {
      console.warn('Unable to read auth user from localStorage', error);
    }

    if (config.url) {
      config.url = config.url.replace(/^\/+/, '');
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;