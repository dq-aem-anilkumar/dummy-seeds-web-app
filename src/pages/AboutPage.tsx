
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">About Marketplace</CardTitle>
          <CardDescription className="text-lg">
            Connecting buyers and sellers in a seamless digital experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              Marketplace is designed to revolutionize how people buy and sell products online. 
              We provide a comprehensive platform that enables users to list their products, 
              manage orders, and connect with customers in an efficient and user-friendly environment.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Product Management</h3>
                <p className="text-blue-700 text-sm">
                  Easy-to-use tools for listing, editing, and managing your products with detailed descriptions and images.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Order Processing</h3>
                <p className="text-green-700 text-sm">
                  Streamlined order management system with real-time tracking and customer communication.
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">User Management</h3>
                <p className="text-purple-700 text-sm">
                  Robust user authentication and role-based access control for secure operations.
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-900 mb-2">Analytics Dashboard</h3>
                <p className="text-orange-700 text-sm">
                  Comprehensive insights and analytics to help you make informed business decisions.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">User Roles</h2>
            <div className="space-y-3">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold">Super Admin</h3>
                <p className="text-gray-600 text-sm">Full system access with user management, product oversight, and analytics dashboard.</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold">Admin</h3>
                <p className="text-gray-600 text-sm">Manage users, products, and orders with approval capabilities.</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold">User</h3>
                <p className="text-gray-600 text-sm">Browse products, manage personal listings, and track orders.</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-3">Contact Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Support</h3>
                <p className="text-gray-600">support@marketplace.com</p>
                <p className="text-gray-600">+1 (555) 123-4567</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Business</h3>
                <p className="text-gray-600">business@marketplace.com</p>
                <p className="text-gray-600">+1 (555) 987-6543</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
