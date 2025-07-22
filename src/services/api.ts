
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.30:8081';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle the standard response format and auth errors
api.interceptors.response.use(
  (response) => {
    // Handle login response which has different format
    if (response.config.url?.includes('/auth/login')) {
      return response;
    }
    
    // Handle standard API responses with response wrapper
    if (response.data && typeof response.data === 'object' && 'response' in response.data) {
      // Extract the actual data from the response wrapper
      return {
        ...response,
        data: {
          data: response.data.response, // The actual data is in the response field
          totalRecords: response.data.totalRecords,
          status: response.data.status,
          flag: response.data.flag,
          message: response.data.message,
          otherInfo: response.data.otherInfo
        }
      };
    }
    
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
