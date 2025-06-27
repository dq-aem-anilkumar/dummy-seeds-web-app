
import api from './api';
import { ProductFormData } from '../types/product';

export const productService = {
  getProducts: async (page = 0, size = 10, search = '', filters: any = {}) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    if (search) params.append('name', search);
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    
    const response = await api.get(`/web/api/v1/product?${params.toString()}`);
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
