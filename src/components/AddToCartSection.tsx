
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

import { toast } from './ui/use-toast';
import { Product } from '../types/product';
import { useCart } from '@/contexts/CartContext';

interface AAddToCartSectionProps {
  product: Product;
  className?: string;
}

export const AddToCartSection: React.FC<AAddToCartSectionProps> = ({ 
  product, 
  className = "" 
}) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(0.1, quantity + change);
    setQuantity(Math.round(newQuantity * 10) / 10);
  };

  const handleAddToCart = () => {
    const result = addToCart(product, quantity);
    
    toast({
      title: result.success ? 'Added to Cart!' : 'Error',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
      duration: 3000, // Auto-dismiss after 3 seconds
    });
  };

  return (
    <div className={`p-4 border border-slate-200 rounded-lg bg-white shadow-sm ${className}`}>
      <h4 className="font-medium mb-2 text-slate-900">{product.name}</h4>
      <p className="text-sm text-slate-600 mb-3">${product.pricePerKg}/kg</p>
      
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-700">Quantity:</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 border-slate-300"
            onClick={() => handleQuantityChange(-0.1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Badge variant="outline" className="min-w-[60px] justify-center border-slate-300">
            {quantity} kg
          </Badge>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 border-slate-300"
            onClick={() => handleQuantityChange(0.1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div className="text-sm text-slate-600 mb-3">
        Total: ${(product.pricePerKg * quantity).toFixed(2)}
      </div>
      
      <Button
        onClick={handleAddToCart}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white"
        disabled={product.quantityKg === 0}
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        {product.quantityKg === 0 ? 'Out of Stock' : 'Add to Cart'}
      </Button>
    </div>
  );
};