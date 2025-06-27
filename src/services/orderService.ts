
import api from './api';
import { OrderFormData } from '../types/order';

export const orderService = {
  getOrders: async (page = 1, limit = 10) => {
    const response = await api.get(`/web/api/v1/order?page=${page}&limit=${limit}`);
    return response.data;
  },

  getOrderById: async (orderId: number) => {
    const response = await api.get(`/web/api/v1/order/view?orderId=${orderId}`);
    return response.data;
  },

  createOrder: async (orderData: OrderFormData, buyerId: string) => {
    const response = await api.post('/web/api/v1/order', orderData, {
      headers: {
        'buyerId': buyerId,
      },
    });
    return response.data;
  },

  deleteOrder: async (orderId: number, reason?: string) => {
    const url = reason ? `/web/api/v1/order/${orderId}?reason=${reason}` : `/web/api/v1/order/${orderId}`;
    const response = await api.delete(url);
    return response.data;
  },
};
