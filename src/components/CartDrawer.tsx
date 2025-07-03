
import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Minus, Plus, Trash2, ShoppingCart, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../hooks/useAuth';
import { orderService } from '../services/orderService';
import { toast } from './ui/use-toast';

const API_BASE_URL = 'http://192.168.1.34:8081/uploads/images/';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ open, onOpenChange }) => {
  const { state, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();

  const handleQuantityChange = (id: number, currentQuantity: number, change: number) => {
    const newQuantity = Math.max(0.1, currentQuantity + change);
    updateQuantity(id, Math.round(newQuantity * 10) / 10);
  };

  const handleCheckout = async () => {
    if (!user || state.items.length === 0) return;
    
    try {
      const orderData = {
        deliveryAddressId: 1,
        orderItems: state.items.map(item => ({
          productId: item.id,
          quantityInKg: item.quantityInKg
        }))
      };
      
      await orderService.createOrder(orderData, user.id);
      
      toast({
        title: 'Order Placed Successfully!',
        description: `${state.totalItems} items ordered for $${state.totalPrice.toFixed(2)}`,
      });
      
      clearCart();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to place order:', error);
      toast({
        title: 'Order Failed',
        description: 'Failed to place your order. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      {/* Backdrop with white blur */}
      <div 
        className={`fixed inset-0 bg-white/70 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => onOpenChange(false)}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-6 w-6 text-slate-700" />
              <h2 className="text-xl font-semibold text-slate-900">Shopping Cart</h2>
              <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                {state.totalItems} items
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {state.items.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingCart className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Your cart is empty</h3>
                <p className="text-slate-500">Add some products to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                      {item.image ? (
                        <img
                          src={`${API_BASE_URL}${item.image}`}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-slate-400 text-xl">📦</div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 mb-1">{item.name}</h4>
                      <p className="text-sm text-slate-500 mb-3">${item.pricePerKg}/kg</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-slate-300"
                            onClick={() => handleQuantityChange(item.id, item.quantityInKg, -0.1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="text-sm font-medium min-w-[60px] text-center bg-white px-2 py-1 rounded border border-slate-200">
                            {item.quantityInKg} kg
                          </span>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-slate-300"
                            onClick={() => handleQuantityChange(item.id, item.quantityInKg, 0.1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <p className="text-sm font-semibold text-slate-900 mt-2">
                        Total: ${(item.pricePerKg * item.quantityInKg).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          {state.items.length > 0 && (
            <div className="border-t border-slate-200 p-6 space-y-4 bg-slate-50">
              <div className="flex justify-between items-center text-lg font-semibold text-slate-900">
                <span>Total: ${state.totalPrice.toFixed(2)}</span>
                <span className="text-sm text-slate-500 font-normal">{state.totalQuantity} kg</span>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                  size="lg"
                >
                  Proceed to Checkout
                </Button>
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="w-full border-slate-300 hover:bg-slate-100"
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};