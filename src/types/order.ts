
export interface OrderItem {
  productId: number;
  quantityInKg: number;
}

export interface Order {
  id: number;
  deliveryAddressId: number;
  orderItems: OrderItem[];
  status?: string;
  createdAt?: string;
  totalAmount?: number;
}

export interface OrderFormData {
  deliveryAddressId: number;
  orderItems: OrderItem[];
}
