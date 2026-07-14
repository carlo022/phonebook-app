import axios from 'axios';

const api = axios.create({
  baseURL:import.meta.env.VITE_API_URL, // Pointing to our Express backend
});

//'http://localhost:5000/api'
//import.meta.env.VITE_API_URL

// Intercept requests to attach the Bearer token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;