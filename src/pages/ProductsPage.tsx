import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { productService } from '../services/productService';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../components/ui/use-toast';
import { Product } from '../types/product';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { PaginationControls } from '@/components/PaginationControls';

const API_BASE_URL = 'http://192.168.1.34:8081/uploads/images/';

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalRecords, setTotalRecords] = useState(0);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const { user, isUser } = useAuth();
  const { addToCart } = useCart();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchProducts = async (page = 0, search = '', filters = {}) => {
    try {
      setLoading(true);
      const response = await productService.getProducts(page, pageSize, search, filters);
      setProducts(response.data || []);
      setTotalRecords(response.totalRecords || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch products',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Main API trigger
  useEffect(() => {
    fetchProducts(currentPage, debouncedSearchTerm);
  }, [debouncedSearchTerm, pageSize, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const minPriceNum = parseFloat(minPrice) || 0;
    const maxPriceNum = parseFloat(maxPrice) || Infinity;

    if (minPrice && maxPrice && minPriceNum > maxPriceNum) {
      toast({
        title: 'Invalid Price Range',
        description: 'Maximum price should be greater than minimum price',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    const filters = {
      minPrice: minPrice ? minPriceNum : undefined,
      maxPrice: maxPrice ? maxPriceNum : undefined,
    };

    fetchProducts(0, searchTerm, filters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  const handleQuantityChange = (productId: number, change: number) => {
    setQuantities(prev => {
      const currentQuantity = prev[productId] || 1;
      const newQuantity = Math.max(0.1, currentQuantity + change);
      return { ...prev, [productId]: Math.round(newQuantity * 10) / 10 };
    });
  };

  const handleAddToCart = (product: Product) => {
    if (!user) return;
    const quantity = quantities[product.id] || 1;
    const result = addToCart(product, quantity);
    toast({
      title: result.success ? 'Added to Cart!' : 'Error',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
      duration: 3000,
    });
  };

  const toggleWishlist = (productId: number) => {
    const updatedWishlist = new Set(wishlist);
    if (wishlist.has(productId)) {
      updatedWishlist.delete(productId);
      toast({
        title: 'Removed',
        description: 'Removed from wishlist.',
        duration: 3000,
      });
    } else {
      updatedWishlist.add(productId);
      toast({
        title: 'Wishlisted',
        description: 'Added to your wishlist!',
        duration: 3000,
      });
    }
    setWishlist(updatedWishlist);
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

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
        <Input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="w-24"
        />
        <Input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-24"
        />
        <Button type="submit">🔍 Search</Button>
      </form>

      {loading ? (
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
      ) : (
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
                    <span className="text-blue-600 font-bold text-lg">₹{product.pricePerKg}/kg</span>
                    <span className="text-sm text-gray-500">{product.remainingQuantityKg}kg in stock</span>
                  </div>

                  {isUser() && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        onClick={() => handleQuantityChange(product.id, -0.1)}
                        variant="outline"
                        className="w-9 h-9 flex items-center justify-center"
                      >
                        -
                      </Button>
                      <span className="flex items-center justify-center w-12">
                        {quantities[product.id] || 1}kg
                      </span>
                      <Button
                        onClick={() => handleQuantityChange(product.id, 0.1)}
                        variant="outline"
                        className="w-9 h-9 flex items-center justify-center"
                      >
                        +
                      </Button>
                    </div>
                  )}

                  {isUser() && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="w-full"
                        disabled={product.remainingQuantityKg === 0}
                      >
                        {product.remainingQuantityKg === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
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
      )}

      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">😕</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Can you try with a different search?</p>
        </div>
      )}

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalRecords={totalRecords}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};
