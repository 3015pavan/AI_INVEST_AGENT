import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Just return the error without redirecting
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  googleLogin: (credential) => api.post('/auth/google', { idToken: credential }),
};

// Portfolio API
export const portfolioAPI = {
  getPortfolios: () => api.get('/portfolios'),
  getPortfolio: (id) => api.get(`/portfolios/${id}`),
  createPortfolio: (data) => api.post('/portfolios', data),
  updatePortfolio: (id, data) => api.put(`/portfolios/${id}`, data),
  deletePortfolio: (id) => api.delete(`/portfolios/${id}`),
  generatePlan: (id, goalData) => api.post(`/portfolios/${id}/generate-plan`, goalData),
};

export default api;
