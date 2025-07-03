// CartContext.tsx


import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Product } from '../types/product';
import { useAuth } from '../hooks/useAuth';

export interface CartItem {
  remainingQuantityKg: number;
  id: number;
  name: string;
  pricePerKg: number;
  quantityInKg: number;
  image?: string;
  availableStock: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number; // distinct items count
  totalQuantity: number; // total quantity in kg
  totalPrice: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantityInKg: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addToCart: (product: Product, quantity: number) => { success: boolean; message: string };
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      let newItems;
      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantityInKg: item.quantityInKg + action.payload.quantityInKg }
            : item
        );
      } else {
        newItems = [...state.items, action.payload];
      }
      
      const totalItems = newItems.length; // distinct items count
      const totalQuantity = newItems.reduce((sum, item) => sum + item.quantityInKg, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + (item.pricePerKg * item.quantityInKg), 0);
      
      return { items: newItems, totalItems, totalQuantity, totalPrice };
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const totalItems = newItems.length;
      const totalQuantity = newItems.reduce((sum, item) => sum + item.quantityInKg, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + (item.pricePerKg * item.quantityInKg), 0);
      
      return { items: newItems, totalItems, totalQuantity, totalPrice };
    }
    
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantityInKg: action.payload.quantityInKg }
          : item
      ).filter(item => item.quantityInKg > 0);
      
      const totalItems = newItems.length;
      const totalQuantity = newItems.reduce((sum, item) => sum + item.quantityInKg, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + (item.pricePerKg * item.quantityInKg), 0);
      
      return { items: newItems, totalItems, totalQuantity, totalPrice };
    }
    
    case 'CLEAR_CART':
      return { items: [], totalItems: 0, totalQuantity: 0, totalPrice: 0 };
    
    case 'LOAD_CART': {
      const totalItems = action.payload.length;
      const totalQuantity = action.payload.reduce((sum, item) => sum + item.quantityInKg, 0);
      const totalPrice = action.payload.reduce((sum, item) => sum + (item.pricePerKg * item.quantityInKg), 0);
      
      return { items: action.payload, totalItems, totalQuantity, totalPrice };
    }
    
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    totalItems: 0,
    totalQuantity: 0,
    totalPrice: 0,
  });

  // Get user-specific cart key
  const getCartKey = () => {
    return user?.id ? `cart_${user.id}` : 'cart_guest';
  };

  // Load cart from localStorage on mount or user change
  useEffect(() => {
    if (user) {
      const cartKey = getCartKey();
      const savedCart = localStorage.getItem(cartKey);
      if (savedCart) {
        try {
          const cartItems = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: cartItems });
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
        }
      }
    }
  }, [user?.id]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      const cartKey = getCartKey();
      localStorage.setItem(cartKey, JSON.stringify(state.items));
    }
  }, [state.items, user?.id]);

  const addToCart = (product: Product, quantity: number): { success: boolean; message: string } => {
    // Stock validation
    const existingItem = state.items.find(item => item.id === product.id);
    const currentQuantity = existingItem ? existingItem.quantityInKg : 0;
    const totalRequestedQuantity = currentQuantity + quantity;

    if (totalRequestedQuantity > product.quantityKg) {
      return {
        success: false,
        message: `Only ${product.quantityKg}kg available. You already have ${currentQuantity}kg in cart.`
      };
    }

    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      pricePerKg: product.pricePerKg,
      quantityInKg: quantity,
      image: product.sampleImage,
      availableStock: product.quantityKg,
    };
    
    dispatch({ type: 'ADD_ITEM', payload: cartItem });
    return {
      success: true,
      message: `${product.name} ${quantity} kg added to cart`
    };
  };

  const removeFromCart = (id: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantityInKg: quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{
      state,
      dispatch,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};