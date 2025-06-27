
import api from './api';
import { OrderFormData } from '../types/order';

export const orderService = {
  getOrders: async (page = 0, size = 10, sortBy = 'orderedAt', direction = 'desc', isForUserSpecific = false) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    params.append('sortBy', sortBy);
    params.append('direction', direction);
    
    if (isForUserSpecific) {
      params.append('isForUserSpecific', 'true');
    }
    
    const response = await api.get(`/web/api/v1/order?${params.toString()}`);
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
