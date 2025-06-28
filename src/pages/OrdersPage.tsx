
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { orderService } from '../services/orderService';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../components/ui/use-toast';
import { Order } from '../types/order';

export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { isUser } = useAuth();

  const fetchOrders = async (page = 0) => {
    try {
      setLoading(true);
      const response = await orderService.getOrders(page, 20);
      setOrders(response.data || []);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast({ title: 'Error', description: 'Failed to fetch orders', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: number) => {
    try {
      await orderService.deleteOrder(orderId, 'Cancelled by user');
      toast({ title: 'Success', description: 'Order cancelled successfully!' });
      fetchOrders(currentPage);
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast({ title: 'Error', description: 'Failed to cancel order', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600">{isUser() ? 'Your orders' : 'All orders'}</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                  <p className="text-sm text-gray-600">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={order.status === 'cancelled' ? 'destructive' : 'default'}>
                    {order.status || 'Pending'}
                  </Badge>
                  {order.totalAmount && (
                    <Badge variant="secondary">${order.totalAmount}</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-medium">Order Items:</h4>
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>Product ID: {item.productId}</span>
                    <span>{item.quantityInKg}kg</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                {order.status !== 'cancelled' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancelOrder(order.id)}
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500">Orders will appear here once placed</p>
        </div>
      )}
    </div>
  );
};
