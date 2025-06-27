
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Package, Users, ShoppingCart, Award } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Marketplace</span>
          </Link>
          <Link to="/login">
            <Button className="bg-blue-600 hover:bg-blue-700">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">Marketplace</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive platform connecting buyers and sellers in a seamless digital marketplace. 
            Manage products, process orders, and build your business with our powerful tools.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Package className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Product Management</CardTitle>
              <CardDescription>
                Easily manage your product catalog with images, descriptions, pricing, and inventory tracking.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <ShoppingCart className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Order Processing</CardTitle>
              <CardDescription>
                Streamlined order management system with real-time tracking and customer communication.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Comprehensive user management with role-based access control and approval workflows.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Role-Based Access */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Role-Based Access Control</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
              <CardHeader>
                <Award className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle className="text-blue-700">Super Admin</CardTitle>
                <CardDescription>
                  Full system access with analytics dashboard, user management, and admin creation capabilities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Dashboard Analytics</li>
                  <li>• Manage All Users</li>
                  <li>• Create Admins</li>
                  <li>• System Configuration</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 hover:border-green-400 transition-colors">
              <CardHeader>
                <Users className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle className="text-green-700">Admin</CardTitle>
                <CardDescription>
                  User and content management with oversight capabilities for marketplace operations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• User Management</li>
                  <li>• Product Oversight</li>
                  <li>• Order Management</li>
                  <li>• Content Moderation</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors">
              <CardHeader>
                <Package className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle className="text-purple-700">User</CardTitle>
                <CardDescription>
                  Seller capabilities with product management and order tracking for marketplace participants.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Manage Products</li>
                  <li>• Process Orders</li>
                  <li>• Track Sales</li>
                  <li>• Customer Communication</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg shadow-lg p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of sellers already using our platform to grow their business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                Create Account
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Marketplace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
