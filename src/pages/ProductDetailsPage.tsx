import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
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
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const API_BASE_URL = 'http://192.168.1.31:8081/uploads/images/';

  useEffect(() => {
    if (id) {
      fetchProductDetail(parseInt(id));
    }
  }, [id]);

  const fetchProductDetail = async (productId: number) => {
    try {
      setLoading(true);
      const productData = await productService.getProductById(productId);
      setProduct(productData);
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

  const handleAddToCart = () => {
    if (!product) return;
    toast({
      title: 'Added to Cart',
      description: `${quantity} ${product.data?.name || product.name}(s) added to your cart`
    });
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist',
      description: `Product ${isWishlisted ? 'removed from' : 'added to'} your wishlist`
    });
  };

  const handleUserRating = (rating: number) => {
    toast({
      title: 'Thanks for rating!',
      description: `You rated this product ${rating} star${rating > 1 ? 's' : ''}`
    });
    setProduct((prev) => (prev ? { ...prev, rating } : prev));
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
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {product.data?.sampleImage ? (
                  <img
                    src={`${API_BASE_URL}${product.data.sampleImage}`}
                    alt={product.data?.name || product.name}
                    className="object-cover w-full h-full"
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
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= (product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">({product.reviews || 0} reviews)</span>
            </div>

            <div className="mb-6 text-2xl font-bold text-gray-900">
              ₹{product.data?.pricePerKg?.toFixed(2) || product.price?.toFixed(2) || 'N/A'}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.data?.description || product.description || 'No description available for this product.'}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>-</Button>
                <span className="px-4 py-2 border rounded-md w-16 text-center">{quantity}</span>
                <Button variant="outline" size="sm" onClick={() => setQuantity(quantity + 1)} disabled={quantity >= product.stock}>+</Button>
                <span className="text-sm text-gray-600 ml-2">({product.stock} available)</span>
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <Button className="flex-1" onClick={handleAddToCart} disabled={!product.availability || product.stock === 0}>
                <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
              </Button>
              <Button variant="outline" onClick={handleWishlist} className={isWishlisted ? 'text-red-600 border-red-600' : ''}>
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </Button>
            </div>

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

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Rate this product</h3>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <Star
                    key={starValue}
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

          </div>
        </div>
      </div>
    </div>
  );
};
