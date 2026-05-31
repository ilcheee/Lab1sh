import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8008/api'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Clear stale token when server says it's invalid/expired
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 &&
        err.response?.data?.message?.includes('Token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(err);
  }
);

export default API;