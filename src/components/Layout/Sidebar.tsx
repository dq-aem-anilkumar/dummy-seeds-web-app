
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

const sidebarItems = {
  SUPER_ADMIN: [
    { title: 'Dashboard', path: '/dashboard', icon: '📊' },
    { title: 'Products', path: '/products', icon: '📦' },
    { title: 'Orders', path: '/orders', icon: '📋' },
    { title: 'Users', path: '/users', icon: '👥' },
    { title: 'Create Admin', path: '/create-admin', icon: '👨‍💼' },
  ],
  ADMIN: [
    { title: 'Users', path: '/users', icon: '👥' },
    { title: 'Products', path: '/products', icon: '📦' },
    { title: 'Orders', path: '/orders', icon: '📋' },
  ],
  USER: [
    { title: 'Products', path: '/products', icon: '📦' },
    { title: 'My Products', path: '/my-products', icon: '🏪' },
    { title: 'My Orders', path: '/my-orders', icon: '🛒' },
  ],
};

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const userRole = user?.userType || 'USER';
  const menuItems = sidebarItems[userRole] || [];

  return (
    <div
      className={cn(
        'bg-white border-r border-gray-200 transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && (
          <h1 className="text-xl font-bold text-gray-800">Marketplace</h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center px-3 py-2 rounded-lg transition-colors text-sm',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-100',
                collapsed && 'justify-center'
              )
            }
          >
            <span className="text-lg mr-3">{item.icon}</span>
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <NavLink
          to="/about"
          className={cn(
            'flex items-center px-3 py-2 rounded-lg transition-colors text-sm text-gray-700 hover:bg-gray-100',
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
