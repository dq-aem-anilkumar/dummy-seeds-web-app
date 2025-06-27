
import api from './api';
import { LoginCredentials, User } from '../types/auth';

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/web/api/v1/auth/login', credentials);
    return response.data;
  },

  register: async (userData: any) => {
    const response = await api.post('/web/api/v1/user/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/web/api/v1/user/profile');
    return response.data;
  },

  updateProfile: async (userData: FormData) => {
    const response = await api.put('/web/api/v1/user/update', userData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadProfileImage: async (imageData: FormData) => {
    const response = await api.post('/web/api/v1/superadmin/uploadimage', imageData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
