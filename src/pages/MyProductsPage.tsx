
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { productService } from '../services/productService';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../components/ui/use-toast';
import { Product, ProductFormData } from '../types/product';

export const MyProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<ProductFormData>>({
    name: '',
    description: '',
    quantityKg: 1,
    pricePerKg: 0,
  });
  const { user } = useAuth();

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      // Filter by current user's products (this would need backend support)
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-600">Manage your product listings</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>Add Product</Button>
      </div>

      {/* Add/Edit Product Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerKg">Price per Kg *</Label>
                  <Input
                    id="pricePerKg" 
                    type="number"
                    step="0.01"
                    value={formData.pricePerKg}
                    onChange={(e) => setFormData({ ...formData, pricePerKg: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantityKg">Quantity (Kg) *</Label>
                  <Input
                    id="quantityKg"
                    type="number"
                    value={formData.quantityKg}
                    onChange={(e) => setFormData({ ...formData, quantityKg: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Product Image *</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] })}
                    required={!editingProduct}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="w-full p-2 border border-input rounded-md"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingProduct(null);
                    setFormData({ name: '', description: '', quantityKg: 1, pricePerKg: 0 });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
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
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    ${product.pricePerKg}/kg
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {product.quantityKg}kg
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {product.description || 'No description available'}
                </p>
                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => handleEdit(product)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
