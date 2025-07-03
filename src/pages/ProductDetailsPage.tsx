import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  Package,
  Truck,
  Shield,
  Heart
} from 'lucide-react';
import { productService } from '../services/productService';
import { toast } from '../components/ui/use-toast';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../hooks/useAuth';

interface ProductDetail {
  data: any;
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  sampleImage?: string;
  stock: number;
  rating?: number;
  reviews?: number;
  brand?: string;
  sku?: string;
  weight?: string;
  dimensions?: string;
  availability: boolean;
  createdAt: string;
  updatedAt: string;
}

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const { addToCart, state } = useCart();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super admin';
  const API_BASE_URL = 'http://192.168.1.34:8081/uploads/images/';

  useEffect(() => {
    if (id) {
      fetchProductDetail(parseInt(id));
    }
  }, [id]);

  const fetchProductDetail = async (productId: number) => {
    try {
      setLoading(true);
      const productData = await productService.getProductById(productId);
      const normalizedStock = productData.data?.stock ?? productData.stock ?? productData.data?.quantityKg ?? 0;
      setProduct({ ...productData, stock: normalizedStock });
    } catch (error) {
      console.error('Failed to fetch product details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load product details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getRemainingStock = () => {
    const cartQty = state.items.find(i => i.id === product?.id)?.quantityInKg || 0;
    return product!.stock - cartQty;
  };

  const handleAddToCart = () => {
    if (!product || quantity <= 0) return;

    const cartProduct = product.data || product;
    const availableStock = product.stock;
    const existingItem = state.items.find(item => item.id === cartProduct.id);
    const existingQuantity = existingItem?.quantityInKg || 0;

    if (existingQuantity + quantity > availableStock) {
      toast({
        title: 'Stock Error',
        description: `Only ${availableStock - existingQuantity} more items available in stock`,
        variant: 'destructive',
      });
      return;
    }

    const result = addToCart(cartProduct, quantity);

    toast({
      title: result.success ? 'Added to Cart!' : 'Error',
      description: result.success
        ? `${quantity} ${cartProduct.name} added to your cart`
        : result.message || 'Failed to add to cart',
      variant: result.success ? 'default' : 'destructive',
      duration: 3000,
    });

    if (result.success) {
      setQuantity(1);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist',
      description: `Product ${isWishlisted ? 'removed from' : 'added to'} your wishlist`
    });
  };

  const handleUserRating = (rating: number) => {
    setProduct((prev) => {
      if (!prev) return prev;
      const newRating = prev.rating === rating ? 0 : rating;
      toast({
        title: newRating === 0 ? 'Rating removed' : 'Thanks for rating!',
        description:
          newRating === 0
            ? 'You removed your rating.'
            : `You rated this product ${newRating} star${newRating > 1 ? 's' : ''}`
      });
      return { ...prev, rating: newRating };
    });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    const cartQuantity = state.items.find(i => i.id === product?.id)?.quantityInKg || 0;
    if (!isNaN(value)) {
      if (value + cartQuantity > product!.stock) {
        toast({
          title: 'Quantity Limit',
          description: `Only ${product!.stock - cartQuantity} more items in stock you can add.`,
          variant: 'destructive'
        });
        setQuantity(Math.max(1, product!.stock - cartQuantity));
      } else {
        setQuantity(Math.max(1, value));
      }
    }
  };

  const handleQuantityBlur = () => {
    if (quantity < 1) setQuantity(1);
  };

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex-1 p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/products')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
      </div>
    );
  }

  const remainingStock = getRemainingStock();

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/products')} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {product.data?.name || product.name}
          </h1>
          <p className="text-gray-600">Product Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardContent className="p-0">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                )}
                {product.data?.sampleImage ? (
                  <img
                    src={`${API_BASE_URL}${product.data.sampleImage}`}
                    alt={product.data?.name || product.name}
                    className="object-cover w-full h-full"
                    onLoad={() => setImageLoading(false)}
                  />
                ) : (
                  <div className="flex justify-center items-center h-full text-gray-400">
                    <Package className="h-24 w-24" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{product.category}</Badge>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                remainingStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {remainingStock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Rate this product</h3>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <Star
                    key={starValue}
                    title={
                      product.rating === starValue
                        ? 'Click again to remove rating'
                        : `Rate ${starValue} star${starValue > 1 ? 's' : ''}`
                    }
                    className={`h-5 w-5 cursor-pointer transition-colors ${
                      starValue <= (product.rating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    } hover:scale-110`}
                    onClick={() => handleUserRating(starValue)}
                  />
                ))}
              </div>
            </div>

            <div className="mb-6 text-2xl font-bold text-gray-900">
              ₹{product.data?.pricePerKg?.toFixed(2) || product.price?.toFixed(2) || 'N/A'}
            </div>

            <div className="mb-6">
              <span className="text-gray-600 leading-relaxed">
                Title: {product.data?.name || product.name || 'No title available for this product.'}
              </span>
            </div>
            <div className="mb-6">
              <span className="text-gray-600 leading-relaxed">
                Description: {product.data?.description || product.description || 'No description available for this product.'}
              </span>
            </div>

            {!isSuperAdmin && (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      name="quantity"
                      value={quantity}
                      onChange={handleQuantityChange}
                      onBlur={handleQuantityBlur}
                      min={1}
                      max={remainingStock}
                      disabled={remainingStock === 0}
                      className="px-4 py-2 border rounded-md w-20 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm text-gray-600 ml-2">
                      ({remainingStock}Kg In Stock)
                    </span>
                  </div>
                  {remainingStock === 0 && (
                    <p className="text-sm text-red-600 mt-2">
                      You have already added all available stock of this product.
                    </p>
                  )}
                </div>

                <div className="flex gap-4 mb-6">
                  <Button
                    className="flex-1"
                    onClick={handleAddToCart}
                    title={
                      !product?.availability
                        ? 'Product is not available'
                        : remainingStock <= 0
                        ? 'Out of stock'
                        : 'Add to Cart'
                    }
                    disabled={remainingStock === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleWishlist}
                    className={isWishlisted ? 'text-red-600 border-red-600' : ''}
                  >
                    <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4" /> Free Shipping
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> Secure Payment
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" /> Easy Returns
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
