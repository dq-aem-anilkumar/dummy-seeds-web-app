import { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../components/ui/use-toast';
import { Order } from '../types/order';
import { Product } from '../types/product';
import { PaginationControls } from '@/components/PaginationControls';

export const MyOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<{ [key: number]: Product }>({});
  const [loading, setLoading] = useState(true);
  const [openAccordionId, setOpenAccordionId] = useState<string>('');

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalRecords, setTotalRecords] = useState(0);

  const { user } = useAuth();

  const fetchMyOrders = async (page = 0, size = pageSize) => {
    try {
      setLoading(true);
      const response = await orderService.getOrders(page, size);
      const userOrders = response.data || [];
      setOrders(userOrders);
      setTotalRecords(response.totalRecords || 0);

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
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handleCancelOrder = async (orderId: number) => {
    try {
      await orderService.deleteOrder(orderId, 'Cancelled by customer');
      toast({
        title: 'Success',
        description: 'Order cancelled successfully!',
      });
      fetchMyOrders(currentPage, pageSize);
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel order',
        variant: 'destructive',
      });
    }
  };

  const calculateOrderTotal = (order: Order): number => {
    return order.orderItems.reduce((total, item) => {
      const product = products[item.productId];
      if (product) {
        return total + product.pricePerKg * item.quantityInKg;
      }
      return total;
    }, 0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <div className="space-y-4">
          {[...Array(pageSize)].map((_, i) => (
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

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">🛒</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500">Your orders will appear here once you make a purchase</p>
          <Button className="mt-4" onClick={() => (window.location.href = '/products')}>
            Browse Products
          </Button>
        </div>
      ) : (
        <Accordion type="single" collapsible value={openAccordionId} onValueChange={setOpenAccordionId} className="space-y-4">
          {orders.map((order) => {
            const orderTotal = calculateOrderTotal(order);
            const orderKey = `order-${order.id}`;
            return (
              <AccordionItem key={order.id} value={orderKey}>
                <Card>
                  <CardHeader className="bg-gray-50 rounded-t-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-semibold text-gray-800">Order #{order.id}</CardTitle>
                        <p className="text-sm text-gray-500">
                          Placed on{' '}
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                              })
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={order.status === 'cancelled' ? 'destructive' : 'default'} className="uppercase text-xs">
                          {order.status || 'Processing'}
                        </Badge>
                        <Badge variant="secondary">₹{orderTotal.toFixed(2)}</Badge>
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
                            const product = products[item.productId];
                            const itemTotal = product ? product.pricePerKg * item.quantityInKg : 0;
                            return (
                              <div key={index} className="flex justify-between items-center p-3 border rounded-md bg-gray-50">
                                <div className="flex gap-4 items-center">
                                  <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                                    {product?.image ? (
                                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-xl">📦</span>
                                    )}
                                  </div>
                                  <div className="text-sm">
                                    <p className="font-medium text-gray-800">{product?.name || `Product ID: ${item.productId}`}</p>
                                    <p className="text-gray-500">
                                      Quantity: {item.quantityInKg}kg
                                      <br />
                                      Price: ₹{product?.pricePerKg}/kg
                                    </p>
                                  </div>
                                </div>
                                <div className="text-sm font-semibold text-gray-800">₹{itemTotal.toFixed(2)}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>
                          <strong>Delivery Address ID:</strong> {order.deliveryAddressId || 'N/A'}
                        </p>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t">
                        <p className="font-semibold text-lg">Total Amount:</p>
                        <p className="text-lg font-bold text-gray-800">₹{orderTotal.toFixed(2)}</p>
                      </div>
                      <div className="flex justify-end space-x-2">
                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                          <Button size="sm" variant="outline" onClick={() => handleCancelOrder(order.id)}>
                            Cancel Order
                          </Button>
                        )}
                        <Button size="sm" variant="default">
                          Track Order
                        </Button>
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalRecords={totalRecords}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};