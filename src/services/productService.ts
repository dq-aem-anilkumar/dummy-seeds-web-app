
import api from './api';
import { ProductFormData } from '../types/product';

export const productService = {
  getProducts: async (page = 1, limit = 10, search = '') => {
    const response = await api.get(`/web/api/v1/product?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
  },

  getProductById: async (productId: number) => {
    const response = await api.get(`/web/api/v1/product/view?productId=${productId}`);
    return response.data;
  },

  createProduct: async (productData: FormData) => {
    const response = await api.post('/web/api/v1/product', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateProduct: async (productData: FormData) => {
    const response = await api.put('/web/api/v1/product/update', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteProduct: async (productId: number) => {
    const response = await api.delete(`/web/api/v1/product/${productId}`);
    return response.data;
  },
};
