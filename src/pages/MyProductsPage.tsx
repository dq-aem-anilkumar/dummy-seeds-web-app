import { useState, useEffect } from 'react';
import { Eye, Edit, MoreHorizontal, Trash } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ProductDialog } from '../components/ProductDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { productService } from '../services/productService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/use-toast';
import { Product } from '@/types/product';
import { PaginationControls } from '@/components/PaginationControls';

export const MyProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'add'>('view');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
    loading: false,
    variant: 'default' as 'default' | 'destructive'
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalRecords, setTotalRecords] = useState(0);

  const API_BASE_URL = 'http://192.168.1.30:8081/uploads/images/';
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMyProducts = async (page = 0) => {
    try {
      setLoading(true);
      const response = await productService.getProducts(page, pageSize, '', {}, { isForUserSpecific: true });
      setProducts(response.data || []);
      setTotalRecords(response.totalRecords || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast({ title: 'Error', description: 'Failed to fetch products', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts(currentPage);
  }, [currentPage, pageSize]);

  const handleDelete = async (productId: number) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      loading: false,
      variant: 'destructive',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, loading: true }));
          await productService.deleteProduct(productId);
          toast({ title: 'Success', description: 'Product deleted successfully!' });
          fetchMyProducts(currentPage);
          setConfirmDialog(prev => ({ ...prev, open: false, loading: false }));
        } catch (error) {
          console.error('Failed to delete product:', error);
          toast({ title: 'Error', description: 'Failed to delete product', variant: 'destructive' });
          setConfirmDialog(prev => ({ ...prev, loading: false }));
        }
      }
    });
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setDialogMode('view');
    setDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setDialogMode('add');
    setDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-600">Manage your product listings</p>
        </div>
        <Button onClick={handleAddProduct} className="bg-blue-600 hover:bg-blue-700">Add Products</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? [...Array(8)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <CardHeader className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        )) : products.map((product) => (
          <Card key={product.id} className="p-4 border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition duration-200 relative">
            <div className="flex justify-between items-start">
              <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                {product.sampleImage ? (
                  <img src={`${API_BASE_URL}${product.sampleImage}`} alt={product.name} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-xl">📦</span>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleView(product)}>
                    <Eye className="mr-2 h-4 w-4" /> View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEdit(product)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Product
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-red-600">
                    <Trash className="mr-2 h-4 w-4" /> Delete Product
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <h3 className="mt-2 font-semibold text-lg text-gray-800 truncate">{product.name}</h3>
            <p className="text-gray-500 text-sm mb-2 line-clamp-2">{product.description || 'No description'}</p>
            <div className="flex justify-between text-sm text-gray-700">
              <span>Price: ₹{product.pricePerKg}/kg</span>
              <span>Qty: {product.quantityKg}kg</span>
            </div>
          </Card>
        ))}
      </div>

      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-500">Add your first product to get started</p>
          <Button className="mt-4" onClick={handleAddProduct}>Add Your First Product</Button>
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

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={selectedProduct}
        mode={dialogMode}
        onProductUpdated={() => fetchMyProducts(currentPage)}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        variant={confirmDialog.variant}
        loading={confirmDialog.loading}
      />
    </div>
  );
};
