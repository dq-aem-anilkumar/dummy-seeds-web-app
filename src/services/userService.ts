
import api from './api';

export const userService = {
  getUsers: async (page = 1, limit = 10, search = '', filter = '') => {
    const response = await api.get(`/web/api/v1/user?page=${page}&limit=${limit}&search=${search}&filter=${filter}`);
    return response.data;
  },

  getUserById: async (userId: string) => {
    const response = await api.get(`/web/api/v1/user/view?userId=${userId}`);
    return response.data;
  },

  updateUser: async (userData: any) => {
    const response = await api.put('/web/api/v1/user/update', userData);
    return response.data;
  },

  deleteUser: async (userId: string) => {
    const response = await api.delete(`/web/api/v1/user/${userId}`);
    return response.data;
  },

  approveUser: async (userId: string) => {
    const response = await api.post(`/web/api/v1/admin/approve/user/${userId}`);
    return response.data;
  },
};
