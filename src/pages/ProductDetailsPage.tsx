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
  Star,
  Package,
  Truck,
  Shield,
  MessageCircleMore,
  MailPlus
} from 'lucide-react';
import { productService } from '../services/productService';
import { toast } from '../components/ui/use-toast';
import { useAuth } from '../hooks/useAuth';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';

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
  ownerId?: string;
  userId?: string;
  pricePerKg?: number;
  quantityKg?: number;
}

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super admin';
  const API_BASE_URL = 'http://192.168.1.34:8081/uploads/images/';
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [desiredPrice, setDesiredPrice] = useState('');
  const [desiredQuantity, setDesiredQuantity] = useState('');

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

  const handleRequestConfirm = async () => {
  try {
    if (!product.data?.id) throw new Error('Missing product or user ID');

    const response = await productService.sendNotificationRequest({
      sellerId: product.data.userId,
      productId: parseInt(product.data.id),
      desireQuantity: parseInt(desiredQuantity),
      desiredPricePerKg: parseFloat(desiredPrice),
    });

    toast({
      title: 'Request Sent',
      description: `Desired Price ₹${desiredPrice} and Quantity ${desiredQuantity}kg sent.`,
    });
  } catch (error) {
    console.error('Failed to send request:', error);
    toast({
      title: 'Request Failed',
      description: 'Unable to send your request',
      variant: 'destructive',
    });
  } finally {
    setIsRequestModalOpen(false);
  }
};

  const handleUserRating = (rating: number) => {
    setProduct((prev) => {
      if (!prev) return prev;
      const newRating = prev.rating === rating ? 0 : rating;
      toast({
        title: newRating === 0 ? 'Rating removed' : 'Thanks for rating!',
        description: newRating === 0
          ? 'You removed your rating.'
          : `You rated this product ${newRating} star${newRating > 1 ? 's' : ''}`
      });
      return { ...prev, rating: newRating };
    });
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
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
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
              <div className="flex gap-4 mb-6">
                <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                      <MailPlus size={18} />
                      Request
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Request</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 text-sm text-gray-700">
                      {product && (
                        <>
                          <img
                            src={`${API_BASE_URL}${product.data?.sampleImage}`}
                            alt={product.data?.name || product.name}
                            className="w-full h-64 object-cover rounded"
                          />
                          <p><strong>Product:</strong> {product.data?.name}</p>
                          <p><strong>Price:</strong> ₹{product.data?.pricePerKg}/kg</p>
                          <p><strong>Stock:</strong> {product.stock}kg</p>
                          <Input
                            type="number"
                            placeholder="Desired Price (₹)"
                            value={desiredPrice}
                            onChange={(e) => setDesiredPrice(e.target.value)}
                          />
                          <Input
                            type="number"
                            placeholder="Desired Quantity (kg)"
                            value={desiredQuantity}
                            onChange={(e) => setDesiredQuantity(e.target.value)}
                          />
                        </>
                      )}
                    </div>
                    <DialogFooter className="mt-4">
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button onClick={handleRequestConfirm}>Confirm</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <MessageCircleMore size={18} />
                  Chat
                </Button>
              </div>
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