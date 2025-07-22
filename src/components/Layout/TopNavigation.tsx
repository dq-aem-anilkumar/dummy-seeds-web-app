import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  MessageCircle,
  Settings,
  User,
  LogOut,
  ChevronDown,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../contexts/CartContext';
import { CartDrawer } from '../CartDrawer';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { toast } from '../ui/use-toast';
import { useImpersonation } from '@/contexts/src/contexts/ImpersonationContext';
import { useChat } from '../../contexts/ChatContext';
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '../ui/dialog';

export const TopNavigation = () => {
  const { user } = useAuth();
  const { state: cartState } = useCart();
  const {
    notifications,
    messages,
    unreadNotifications,
    unreadMessages,
    showNotificationDialog,
    pendingRequest,
    respondToRequest,
    setPendingRequest,
    setShowNotificationDialog,
  } = useChat();

  const { isImpersonating, exitImpersonation } = useImpersonation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      if (isImpersonating) await exitImpersonation();
    } catch {
      localStorage.removeItem('impersonation_data');
      localStorage.removeItem('original_user');
    }
    dispatch(logout());
    toast({ title: 'Success', description: 'Logged out successfully' });
    navigate('/login');
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notification.id });
    }
    if (notification.type === 'CHAT_REQUEST' || notification.type === 'CALL_REQUEST') {
      setPendingRequest(notification.data);
      setShowNotificationDialog(true);
    }
  };

  const handleRespondToRequest = async (isRequestAccepted: boolean) => {
    if (!pendingRequest) return;
    setLoading(true);
    await respondToRequest(pendingRequest.requestId, isRequestAccepted);
    setLoading(false);
    setShowNotificationDialog(false);
  };

  return (
    <>
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-slate-800">Dashboard</h2>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative hover:bg-slate-100" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="h-5 w-5 text-slate-600" />
            {cartState.totalItems > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center">
                {cartState.totalItems}
              </Badge>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-slate-100">
                <Bell className="h-5 w-5 text-slate-600" />
                {unreadNotifications > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center">
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-80 overflow-y-auto">
              <div className="p-3 border-b">
                <h3 className="font-semibold text-slate-800">Notifications</h3>
              </div>
              {notifications.length === 0 ? (
                <div className="p-3 text-sm text-slate-500">No notifications</div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="p-3 cursor-pointer" onClick={() => handleNotificationClick(notification)}>
                    <div className="flex-1">
                      <p className={`text-sm ${!notification.read ? 'font-semibold' : ''}`}>{notification.title}</p>
                      <p className="text-xs text-slate-600 truncate">{notification.message}</p>
                      <p className="text-xs text-slate-500">{new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-slate-100">
                <MessageCircle className="h-5 w-5 text-slate-600" />
                {unreadMessages > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center">
                    {unreadMessages}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-3 border-b">
                <h3 className="font-semibold text-slate-800">Messages</h3>
              </div>
              {messages.slice(0, 5).map((message) => (
                <DropdownMenuItem key={message.id} className="p-3 cursor-pointer">
                  <div className="flex-1">
                    <p className={`text-sm ${!message.read ? 'font-semibold' : ''}`}>Chat Message</p>
                    <p className="text-xs text-slate-600 truncate">{message.content}</p>
                    <p className="text-xs text-slate-500">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  {!message.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="hover:bg-slate-100">
            <Settings className="h-5 w-5 text-slate-600" />
          </Button>

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
                <User className="mr-2 h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/edit-profile')} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" /> Edit Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent className="bg-white backdrop-blur-sm">
          <DialogHeader>
            <h2 className="text-lg font-semibold">Respond to Request</h2>
          </DialogHeader>
          {pendingRequest && (
            <div className="space-y-2">
              <p>
                <strong>{pendingRequest.senderName}</strong> wants to{' '}
                {pendingRequest.requestType.toLowerCase()} about{' '}
                <strong>{pendingRequest.productName}</strong>
              </p>
            </div>
          )}
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleRespondToRequest(false)} disabled={loading}>
              Reject
            </Button>
            <Button onClick={() => handleRespondToRequest(true)} disabled={loading}>
              Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
};