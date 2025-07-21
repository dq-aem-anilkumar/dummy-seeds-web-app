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
import { toast } from '../components/ui/use-toast';
import { Product } from '../types/product';
import { useNavigate } from 'react-router-dom';
import { PaginationControls } from '@/components/PaginationControls';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '../components/ui/dialog';
import { MailPlus, MessageCircleMore } from 'lucide-react';

const API_BASE_URL = 'http://192.168.1.25:8081/uploads/images/';

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
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
  const [pageSize, setPageSize] = useState(25);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [desiredPrice, setDesiredPrice] = useState('');
  const [desiredQuantity, setDesiredQuantity] = useState('');

  const navigate = useNavigate();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchProducts = async (page = 0, search = '', filters = {}) => {
    try {
      setLoading(true);
      const response = await productService.getProducts(page, pageSize, search, filters);
      setProducts(response.data || []);
      setTotalRecords(response.totalRecords || 0);
      setCurrentPage(page);
    } catch (error) {
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
    fetchProducts(currentPage, debouncedSearchTerm);
  }, [debouncedSearchTerm, pageSize, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || Infinity;

    if (min && max && min > max) {
      toast({
        title: 'Invalid Price Range',
        description: 'Max price must be greater than Min price',
        variant: 'destructive'
      });
      return;
    }

    fetchProducts(0, searchTerm, {
      minPrice: min || undefined,
      maxPrice: max || undefined
    });
  };

  const handleRequestConfirm = async () => {
    if (!selectedProduct) return;

    try {
      const payload = {
        sellerId: selectedProduct.userId,
        productId: selectedProduct.id,
        desireQuantity: parseInt(desiredQuantity),
        desiredPricePerKg: parseFloat(desiredPrice),
      };

      await productService.sendNotificationRequest(payload);

      toast({
        title: 'Request Sent',
        description: `Desired Price ₹${desiredPrice}/kg and Quantity ${desiredQuantity}kg sent.`,
      });
    } catch (error) {
      console.error('Failed to send request:', error);
      toast({
        title: 'Request Failed',
        description: 'Unable to send your request',
        variant: 'destructive'
      });
    } finally {
      setIsRequestModalOpen(false);
    }
  };

  const handleOpenRequest = (product: Product) => {
    setSelectedProduct(product);
    setDesiredPrice('');
    setDesiredQuantity('');
    setIsRequestModalOpen(true);
  };

  const handleCardClick = (id: number) => {
    navigate(`/product-details/${id}`);
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
          {products.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden border rounded-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
            >
              <div onClick={() => handleCardClick(product.id)} className="cursor-pointer">
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
              </div>
              <CardContent className="px-4 pb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-bold text-lg">
                    ₹{product.pricePerKg}/kg
                  </span>
                  <span className="text-sm text-gray-500">
                    {product.remainingQuantityKg}kg in stock
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleOpenRequest(product)}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <MailPlus size={18} />
                    Request
                  </Button>

                  <Button
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <MessageCircleMore size={18} />
                    Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-gray-700">
            {selectedProduct && (
              <>
                <img
                  src={`${API_BASE_URL}${selectedProduct.sampleImage}`}
                  alt={selectedProduct.name}
                  className="w-full h-64 object-cover rounded"
                />
                <p><strong>Product:</strong> {selectedProduct.name}</p>
                <p><strong>Price:</strong> ₹{selectedProduct.pricePerKg}/kg</p>
                <p><strong>Stock:</strong> {selectedProduct.remainingQuantityKg}kg</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="desiredPrice" className="block text-xs font-medium text-gray-700">
                      Desired Price (₹/kg)
                    </label>
                    <input
                      id="desiredPrice"
                      type="number"
                      min="0"
                      value={desiredPrice}
                      onChange={(e) => setDesiredPrice(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 text-sm"
                      placeholder="Enter your price"
                    />
                  </div>
                  <div>
                    <label htmlFor="desiredQty" className="block text-xs font-medium text-gray-700">
                      Desired Quantity (kg)
                    </label>
                    <input
                      id="desiredQty"
                      type="number"
                      min="1"
                      value={desiredQuantity}
                      onChange={(e) => setDesiredQuantity(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 text-sm"
                      placeholder="Enter quantity"
                    />
                  </div>
                </div>
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
    </div>
  );
};