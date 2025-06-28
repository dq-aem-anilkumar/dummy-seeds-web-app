
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../components/ui/use-toast';
import { Order } from '../types/order';
import { Product } from '../types/product';

export const MyOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<{ [key: number]: Product }>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrders(0, 100);
      const userOrders = response.data || [];
      setOrders(userOrders);

      // Fetch product details for each order item
      const productIds = new Set<number>();
      userOrders.forEach((order: Order) => {
        order.orderItems.forEach(item => productIds.add(item.productId));
      });

      const productDetails: { [key: number]: Product } = {};
      for (const productId of productIds) {
        try {
          const productResponse = await productService.getProductById(productId);
          productDetails[productId] = productResponse.data;
        } catch (error) {
          console.error(`Failed to fetch product ${productId}:`, error);
        }
      }
      setProducts(productDetails);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast({ title: 'Error', description: 'Failed to fetch orders', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const handleCancelOrder = async (orderId: number) => {
    try {
      await orderService.deleteOrder(orderId, 'Cancelled by customer');
      toast({ title: 'Success', description: 'Order cancelled successfully!' });
      fetchMyOrders();
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast({ title: 'Error', description: 'Failed to cancel order', variant: 'destructive' });
    }
  };

  const calculateOrderTotal = (order: Order): number => {
    return order.orderItems.reduce((total, item) => {
      const product = products[item.productId];
      if (product) {
        return total + (product.pricePerKg * item.quantityInKg);
      }
      return total;
    }, 0);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
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
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600">Track and manage your orders</p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const orderTotal = calculateOrderTotal(order);
          
          return (
            <Card key={order.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Order #{order.id}</CardTitle>
                    <p className="text-sm text-gray-600">
                      Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={order.status === 'cancelled' ? 'destructive' : 'default'}>
                      {order.status || 'Processing'}
                    </Badge>
                    <Badge variant="secondary" className="text-lg font-semibold">
                      ${orderTotal.toFixed(2)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div>
                  <h4 className="font-semibold mb-3">Order Items:</h4>
                  <div className="space-y-3">
                    {order.orderItems.map((item, index) => {
                      const product = products[item.productId];
                      const itemTotal = product ? product.pricePerKg * item.quantityInKg : 0;
                      
                      return (
                        <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            {product?.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            ) : (
                              <span className="text-2xl">📦</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium">
                              {product?.name || `Product ID: ${item.productId}`}
                            </h5>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantityInKg}kg
                            </p>
                            {product && (
                              <p className="text-sm text-gray-600">
                                Price: ${product.pricePerKg}/kg
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${itemTotal.toFixed(2)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Delivery Address ID:</span>
                    <span className="font-medium">{order.deliveryAddressId}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span>${orderTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Order Actions */}
                <div className="flex justify-end space-x-2 pt-4">
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <Button
                      variant="outline"
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      Cancel Order
                    </Button>
                  )}
                  <Button variant="outline">
                    Track Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">🛒</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500">Your orders will appear here once you make a purchase</p>
          <Button className="mt-4" onClick={() => window.location.href = '/products'}>
            Browse Products
          </Button>
        </div>
      )}
    </div>
  );
};
