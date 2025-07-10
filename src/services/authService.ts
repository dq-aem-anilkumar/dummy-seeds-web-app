
import api from './api';

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  headerUserId: string;
  name: string;
}

export interface RegisterRequest {
  userName: string;
  name: string;
  mobileNumber: string;
  email: string;
  password: string;
  adhaarNumber?: string;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/web/api/v1/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest) => {
    const formData = new FormData();
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        formData.append(key, value);
      }
    });
    
    const response = await api.post('/web/api/v1/user/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('impersonation_data');
    localStorage.removeItem('original_user');
  }
};
