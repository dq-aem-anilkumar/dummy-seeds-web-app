
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BarChart3, Package, ShoppingCart, Users, UserPlus, Store, MessageCircleMore, MailPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

const sidebarItems = {
  SUPER_ADMIN: [
    { title: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { title: 'Products', path: '/products', icon: Package },
    { title: 'Orders', path: '/orders', icon: ShoppingCart },
    { title: 'Users', path: '/users', icon: Users },
    { title: 'Create Admin', path: '/create-admin', icon: UserPlus },
  ],
  ADMIN: [
    { title: 'Users', path: '/users', icon: Users },
    { title: 'Products', path: '/products', icon: Package },
    { title: 'Impersonation', path: '/impersonation', icon: MessageCircleMore },
  ],
  USER: [
    { title: 'Products', path: '/products', icon: Package },
    { title: 'My Products', path: '/my-products', icon: Store },
    { title: 'My Orders', path: '/my-orders', icon: ShoppingCart },
  ],
};

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  const userRole = user?.userType || 'USER';
  const menuItems = sidebarItems[userRole] || [];

  return (
    <div
      className={cn(
        'bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-lg',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700">
        {!collapsed && (
          <h1 className="text-xl font-bold text-white">Marketplace</h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-blue-500 transition-colors text-white"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 bg-gray-50">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-3 py-3 rounded-lg transition-all duration-200 text-sm font-medium group',
                  isActive
                    ? 'bg-blue-100 text-blue-700 shadow-sm border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-white hover:shadow-sm',
                  collapsed && 'justify-center px-2'
                )
              }
            >
              <IconComponent className={cn('h-5 w-5', !collapsed && 'mr-3')} />
              {!collapsed && (
                <span className="group-hover:translate-x-1 transition-transform duration-200">
                  {item.title}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <NavLink
          to="/about"
          className={cn(
            'flex items-center px-3 py-2 rounded-lg transition-colors text-sm text-gray-700 hover:bg-white hover:shadow-sm',
            collapsed && 'justify-center'
          )}
        >
          <span className="text-lg mr-3">ℹ️</span>
          {!collapsed && <span>About</span>}
        </NavLink>
      </div>
    </div>
  );
};
