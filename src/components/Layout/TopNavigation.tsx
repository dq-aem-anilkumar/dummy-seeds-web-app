import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageCircle, Settings, User, LogOut, ChevronDown, ShoppingCart } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../contexts/CartContext';
import { CartDrawer } from '../CartDrawer';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { toast } from '../ui/use-toast';

export const TopNavigation = () => {
  const { user } = useAuth();
  const { state: cartState } = useCart();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);
  
  const [notifications] = useState([
    { id: 1, title: 'New order received', time: '5 min ago', read: false },
    { id: 2, title: 'User registered', time: '1 hour ago', read: false },
    { id: 3, title: 'System update completed', time: '2 hours ago', read: true },
  ]);
  const [messages] = useState([
    { id: 1, from: 'John Doe', message: 'Hello, I need help with...', time: '10 min ago', read: false },
    { id: 2, from: 'Jane Smith', message: 'Product inquiry about...', time: '30 min ago', read: true },
  ]);

  const handleLogout = () => {
    dispatch(logout());
    toast({ title: 'Success', description: 'Logged out successfully' });
    navigate('/login');
  };

  const handleNotificationClick = () => {
    toast({ title: 'Notifications', description: 'Notification panel opened' });
  };

  const handleMessageClick = () => {
    toast({ title: 'Messages', description: 'Message panel opened' });
  };

  const handleSettingsClick = () => {
    toast({ title: 'Settings', description: 'Settings panel opened' });
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const unreadMessages = messages.filter(m => !m.read).length;

  return (
    <>
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-slate-800">
            Dashboard
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          {/* Cart - Updated to show distinct items count */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-slate-100"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5 text-slate-600" />
            {cartState.totalItems > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
              >
                {cartState.totalItems}
              </Badge>
            )}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:bg-slate-100"
                onClick={handleNotificationClick}
              >
                <Bell className="h-5 w-5 text-slate-600" />
                {unreadNotifications > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
                  >
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-3 border-b">
                <h3 className="font-semibold text-slate-800">Notifications</h3>
              </div>
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="p-3 cursor-pointer">
                  <div className="flex-1">
                    <p className={`text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-slate-500">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Messages */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:bg-slate-100"
                onClick={handleMessageClick}
              >
                <MessageCircle className="h-5 w-5 text-slate-600" />
                {unreadMessages > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
                  >
                    {unreadMessages}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-3 border-b">
                <h3 className="font-semibold text-slate-800">Messages</h3>
              </div>
              {messages.map((message) => (
                <DropdownMenuItem key={message.id} className="p-3 cursor-pointer">
                  <div className="flex-1">
                    <p className={`text-sm ${!message.read ? 'font-semibold' : ''}`}>
                      {message.from}
                    </p>
                    <p className="text-xs text-slate-600 truncate">{message.message}</p>
                    <p className="text-xs text-slate-500">{message.time}</p>
                  </div>
                  {!message.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          {/* <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-slate-100"
            onClick={handleSettingsClick}
          >
            <Settings className="h-5 w-5 text-slate-600" />
          </Button> */}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 hover:bg-slate-100">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImage || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-slate-800">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.userType}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/edit-profile')} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
};