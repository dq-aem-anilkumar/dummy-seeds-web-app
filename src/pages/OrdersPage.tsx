import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion';
import { orderService } from '../services/orderService';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../components/ui/use-toast';
import { Order } from '../types/order';

export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { isUser } = useAuth();
  const API_BASE_URL = 'http://192.168.1.38:8081/uploads/images/';

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
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
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
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600">Track and manage your orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500">Orders will appear here once placed</p>
        </div>
      ) : (
        <Accordion type="multiple" className="space-y-4">
          {orders.map((order) => {
            const totalAmount = order.orderItems.reduce((sum, item) => {
              const price = item.pricePerKg || 0;
              const quantity = item.quantityInKg || 0;
              return sum + price * quantity;
            }, 0);

            return (
              <AccordionItem key={order.id} value={`order-${order.id}`}>
                <Card>
                  <CardHeader className="bg-gray-50 rounded-t-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold">Order #{order.id}</CardTitle>
                        <p className="text-sm text-gray-600">
                          Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={order.status === 'cancelled' ? 'destructive' : 'default'}>
                          {order.status || 'Pending'}
                        </Badge>
                        <Badge variant="secondary">${totalAmount.toFixed(2)}</Badge>
                      </div>
                    </div>
                    <AccordionTrigger className="w-full text-left mt-4 text-sm text-gray-600 hover:text-black transition">
                      View Items
                    </AccordionTrigger>
                  </CardHeader>

                  <AccordionContent>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Order Items:</h4>
                        <div className="space-y-3">
                          {order.orderItems.map((item, index) => {
                            const itemTotal = (item.pricePerKg || 0) * (item.quantityInKg || 0);
                            return (
                              <div
                                key={index}
                                className="flex justify-between items-center p-3 border rounded-md bg-gray-50"
                              >
                                <div className="flex gap-4 items-center">
                                  <img
                                     src={`${API_BASE_URL}${item.sampleImage}`}
                                    alt={item.productName || 'Product'}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                  <div className="text-sm">
                                    <p className="font-medium">{item.productName || `Product ID: ${item.productId}`}</p>
                                    <p className="text-gray-500">
                                      Quantity: {item.quantityInKg}kg<br />
                                      Price: ₹{item.pricePerKg}/kg
                                    </p>
                                  </div>
                                </div>
                                <div className="text-sm font-semibold">₹{itemTotal.toFixed(2)}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        <p><strong>Delivery Address ID:</strong> {order.deliveryAddressId || 'N/A'}</p>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t">
                        <p className="font-semibold text-lg">Total Amount:</p>
                        <p className="text-lg font-bold text-gray-800">₹{totalAmount.toFixed(2)}</p>
                      </div>

                      <div className="flex justify-end space-x-2">
                        {order.status !== 'cancelled' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            Cancel Order
                          </Button>
                        )}
                        <Button size="sm" variant="default">Track Order</Button>
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
};
