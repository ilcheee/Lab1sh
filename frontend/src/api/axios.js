import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8008/api'
});

// Çdo request automatikisht dërgon token nëse ekziston
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;