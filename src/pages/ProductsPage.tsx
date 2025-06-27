
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../components/ui/use-toast';
import { Product } from '../types/product';

export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user, isUser } = useAuth();

  const fetchProducts = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await productService.getProducts(page, 12, search);
      setProducts(response.data || []);
      setTotalPages(Math.ceil((response.total || 0) / 12));
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast({ title: 'Error', description: 'Failed to fetch products', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(1, searchTerm);
  };

  const handleAddToCart = async (productId: number, quantityInKg: number = 1) => {
    if (!user) return;
    
    try {
      const orderData = {
        deliveryAddressId: 1, // This would come from user's addresses
        orderItems: [{ productId, quantityInKg }]
      };
      
      await orderService.createOrder(orderData, user.id);
      toast({ title: 'Success', description: 'Product added to cart successfully!' });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast({ title: 'Error', description: 'Failed to add product to cart', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Products</h1>
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Browse all available products</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button type="submit">Search</Button>
      </form>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400 text-4xl">📦</div>
              )}
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <CardDescription className="text-sm line-clamp-2">
                {product.description || 'No description available'}
              </CardDescription>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  ${product.pricePerKg}/kg
                </Badge>
                <span className="text-sm text-gray-500">
                  {product.quantityKg}kg available
                </span>
              </div>
            </CardHeader>
            {isUser() && (
              <CardContent>
                <Button
                  onClick={() => handleAddToCart(product.id)}
                  className="w-full"
                  disabled={product.quantityKg === 0}
                >
                  {product.quantityKg === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchProducts(currentPage - 1, searchTerm)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 py-2 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => fetchProducts(currentPage + 1, searchTerm)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
