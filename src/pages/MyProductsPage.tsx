import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { productService } from '../services/productService';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../components/ui/use-toast';
import { Product, ProductFormData } from '../types/product';
import { MoreHorizontal, Eye, Pencil, Trash } from 'lucide-react';

export const MyProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const API_BASE_URL = 'http://192.168.1.38:8081/uploads/images/';
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<ProductFormData>>({
    name: '',
    description: '',
    quantityKg: 1,
    pricePerKg: 0,
  });
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts(0, 100, '', {}, { isForUserSpecific: true });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast({ title: 'Error', description: 'Failed to fetch products', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.image || formData.pricePerKg === 0) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    try {
      const productFormData = new FormData();
      productFormData.append('name', formData.name);
      productFormData.append('description', formData.description || '');
      productFormData.append('quantityKg', formData.quantityKg?.toString() || '1');
      productFormData.append('pricePerKg', formData.pricePerKg?.toString() || '0');
      productFormData.append('image', formData.image);

      if (editingProduct) {
        productFormData.append('id', editingProduct.id.toString());
        await productService.updateProduct(productFormData);
        toast({ title: 'Success', description: 'Product updated successfully!' });
      } else {
        await productService.createProduct(productFormData);
        toast({ title: 'Success', description: 'Product created successfully!' });
      }

      setShowAddForm(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', quantityKg: 1, pricePerKg: 0 });
      fetchMyProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
      toast({ title: 'Error', description: 'Failed to save product', variant: 'destructive' });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      quantityKg: product.quantityKg,
      pricePerKg: product.pricePerKg,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productService.deleteProduct(productId);
      toast({ title: 'Success', description: 'Product deleted successfully!' });
      fetchMyProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast({ title: 'Error', description: 'Failed to delete product', variant: 'destructive' });
    }
  };

  const handleView = (productId: number) => {
    navigate(`/product-details`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-600">Manage your product listings</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>Add Product</Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* form contents unchanged */}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading
          ? [...Array(8)].map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg"></div>
                <CardHeader className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))
          : products.map((product) => (
              <Card
                key={product.id}
                className="p-4 border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition duration-200 relative"
              >
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                    {product.sampleImage ? (
                      <img
                        src={`${API_BASE_URL}${product.sampleImage}`}
                        alt={product.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-xl">📦</span>
                    )}
                  </div>
                  <div className="relative">
                    <MoreHorizontal
                      className="cursor-pointer text-gray-400"
                      onClick={() => setOpenDropdownId(openDropdownId === product.id ? null : product.id)}
                    />
                    {openDropdownId === product.id && (
                      <div className="absolute z-10 bg-white border shadow rounded-md right-0 mt-2 w-32">
                        <button className="w-full flex items-center px-3 py-2 text-sm hover:bg-gray-50" onClick={() => handleView(product.id)}>
                          <Eye className="w-4 h-4 mr-2" /> View
                        </button>
                        <button className="w-full flex items-center px-3 py-2 text-sm hover:bg-gray-50" onClick={() => handleEdit(product)}>
                          <Pencil className="w-4 h-4 mr-2" /> Edit
                        </button>
                        <button className="w-full flex items-center px-3 py-2 text-sm text-red-500 hover:bg-gray-50" onClick={() => handleDelete(product.id)}>
                          <Trash className="w-4 h-4 mr-2" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="mt-2 font-semibold text-lg text-gray-800 truncate">
                  {product.name}
                </h3>
                <p className="text-gray-500 text-sm mb-2 line-clamp-2">
                  {product.description || 'No description'}
                </p>
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Price: ${product.pricePerKg}/kg</span>
                  <span>Qty: {product.quantityKg}kg</span>
                </div>
                <hr className="my-3 border-t" />
                <div className="flex gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 fill-current"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.078 3.318a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.078 3.319c.3.92-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.198-1.539-1.119l1.078-3.318a1 1 0 00-.364-1.119L2.97 8.745c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.079-3.318z" />
                    </svg>
                  ))}
                </div>
              </Card>
            ))}
      </div>

      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-500">Add your first product to get started</p>
          <Button className="mt-4" onClick={() => setShowAddForm(true)}>
            Add Your First Product
          </Button>
        </div>
      )}
    </div>
  );
};
