import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../components/ui/card';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../components/ui/use-toast';
import { Product } from '../types/product';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());

  const { user, isUser } = useAuth();
  const API_BASE_URL = 'http://192.168.1.34:8081/uploads/images/';

  const fetchProducts = async (page = 0, search = '') => {
    try {
      setLoading(true);
      const response = await productService.getProducts(page, 12, search);
      setProducts(response.data || []);
      setTotalPages(Math.ceil((response.totalPages || 0) / 12));
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch products',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(0, searchTerm);
  };

  const handleAddToCart = async (productId: number, quantityInKg: number = 1) => {
    if (!user) return;

    try {
      const orderData = {
        deliveryAddressId: 1,
        orderItems: [{ productId, quantityInKg }]
      };

      await orderService.createOrder(orderData, user.id);
      toast({
        title: 'Success',
        description: 'Product added to cart successfully!'
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add product to cart',
        variant: 'destructive'
      });
    }
  };

  const toggleWishlist = (productId: number) => {
    const updatedWishlist = new Set(wishlist);
    if (wishlist.has(productId)) {
      updatedWishlist.delete(productId);
      toast({ title: 'Removed', description: 'Removed from wishlist.' });
    } else {
      updatedWishlist.add(productId);
      toast({ title: 'Wishlisted', description: 'Added to your wishlist!' });
    }
    setWishlist(updatedWishlist);
  };

  if (loading) {
    return (
      <div className="space-y-6 px-4">
        <h1 className="text-2xl font-bold text-gray-900">Loading Products...</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-gray-600">Explore fresh and quality seeds & produce</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-2 items-center">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64"
        />
        <Button type="submit">🔍 Search</Button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => {
          const isWishlisted = wishlist.has(product.id);
          return (
            <Card
              key={product.id}
              className="overflow-hidden border rounded-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
            >
              <Link to={`/product-details/${product.id}`}>
                <div className="relative aspect-square bg-gray-100 group-hover:brightness-90 transition-all duration-300">
                  {product.sampleImage ? (
                    <img
                      src={`${API_BASE_URL}${product.sampleImage}`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-5xl text-gray-400">
                      📦
                    </div>
                  )}
                </div>

                <CardHeader className="space-y-2 px-4 pt-4">
                  <CardTitle className="text-xl font-semibold">{product.name}</CardTitle>
                  <CardDescription className="text-gray-600 line-clamp-2">
                    {product.description || 'No description available'}
                  </CardDescription>
                </CardHeader>
              </Link>

              <CardContent className="px-4 pb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-green-600 font-bold text-lg">
                    ₹{product.pricePerKg}/kg
                  </span>
                  <span className="text-sm text-gray-500">
                    {product.quantityKg}kg in stock
                  </span>
                </div>

                {isUser() && (
                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={() => handleAddToCart(product.id)}
                      className="w-full"
                      disabled={product.quantityKg === 0}
                    >
                      {product.quantityKg === 0 ? '❌ Out of Stock' : '🛒 Add to Cart'}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => toggleWishlist(product.id)}
                      className={`rounded-full w-9 h-9 flex items-center justify-center transition-all duration-200 ${
                        isWishlisted ? 'text-red-600 border-blue-600' : ''
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">😕</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Can you Try with correct Search....!</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => fetchProducts(currentPage - 1, searchTerm)}
            disabled={currentPage === 1}
          >
            ← Prev
          </Button>
          <span className="text-sm text-gray-600 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => fetchProducts(currentPage + 1, searchTerm)}
            disabled={currentPage === totalPages}
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  );
};
