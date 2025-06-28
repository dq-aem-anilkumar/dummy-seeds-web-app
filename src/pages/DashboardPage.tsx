
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { userService } from '../services/userService';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';

interface DashboardStats {
  products: {
    total: number;
    active: number;
    disabled: number;
  };
  orders: {
    total: number;
    placed: number;
    cancelled: number;
  };
  users: {
    total: number;
    approved: number;
    pending: number;
    disabled: number;
  };
  admins: {
    total: number;
  };
}

export const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    products: { total: 0, active: 0, disabled: 0 },
    orders: { total: 0, placed: 0, cancelled: 0 },
    users: { total: 0, approved: 0, pending: 0, disabled: 0 },
    admins: { total: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch dashboard statistics with proper error handling
        const [productsRes, ordersRes, usersRes] = await Promise.allSettled([
          productService.getProducts(0, 1000),
          orderService.getOrders(0, 1000),
          userService.getUsers(0, 1000),
        ]);

        let products: any[] = [];
        let orders: any[] = [];
        let users: any[] = [];

        // Handle products response
        if (productsRes.status === 'fulfilled') {
          products = productsRes.value?.data || [];
        }

        // Handle orders response
        if (ordersRes.status === 'fulfilled') {
          orders = ordersRes.value?.data || [];
        }

        // Handle users response
        if (usersRes.status === 'fulfilled') {
          users = usersRes.value?.data || [];
        }

        setStats({
          products: {
            total: products.length,
            active: products.filter((p: any) => p.isActive).length,
            disabled: products.filter((p: any) => !p.isActive).length,
          },
          orders: {
            total: orders.length,
            placed: orders.filter((o: any) => o.status !== 'cancelled').length,
            cancelled: orders.filter((o: any) => o.status === 'cancelled').length,
          },
          users: {
            total: users.length,
            approved: users.filter((u: any) => u.approvalStatus && u.isActive).length,
            pending: users.filter((u: any) => !u.approvalStatus).length,
            disabled: users.filter((u: any) => !u.isActive).length,
          },
          admins: {
            total: users.filter((u: any) => u.userType === 'ADMIN' || u.userType === 'SUPER_ADMIN').length,
          },
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your marketplace analytics</p>
      </div>

      {/* Products Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">Total Products</CardTitle>
              <CardDescription className="text-2xl font-bold text-gray-900">
                {stats.products.total}
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">Active Products</CardTitle>
              <CardDescription className="text-2xl font-bold text-green-600">
                {stats.products.active}
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">Disabled Products</CardTitle>
              <CardDescription className="text-2xl font-bold text-red-600">
                {stats.products.disabled}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Orders Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Orders</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">Total Orders</CardTitle>
              <CardDescription className="text-2xl font-bold text-gray-900">
                {stats.orders.total}
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">Orders Placed</CardTitle>
              <CardDescription className="text-2xl font-bold text-green-600">
                {stats.orders.placed}
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">Orders Cancelled</CardTitle>
              <CardDescription className="text-2xl font-bold text-red-600">
                {stats.orders.cancelled}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Users Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Users</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
              <CardDescription className="text-2xl font-bold text-gray-900">
                {stats.users.total}
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">Approved Users</CardTitle>
              <CardDescription className="text-2xl font-bold text-green-600">
                {stats.users.approved}
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">Pending Approval</CardTitle>
              <CardDescription className="text-2xl font-bold text-yellow-600">
                {stats.users.pending}
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">Disabled Users</CardTitle>
              <CardDescription className="text-2xl font-bold text-red-600">
                {stats.users.disabled}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Admins Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Administration</h2>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">Total Admins</CardTitle>
              <CardDescription className="text-2xl font-bold text-blue-600">
                {stats.admins.total}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};
