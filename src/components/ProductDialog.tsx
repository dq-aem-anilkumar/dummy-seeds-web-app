import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { toast } from './ui/use-toast';
import { productService } from '../services/productService';
import { Product, ProductFormData } from '@/types/product';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  mode: 'view' | 'edit' | 'add';
  onProductUpdated: () => void;
}

export const ProductDialog = ({
  open,
  onOpenChange,
  product,
  mode,
  onProductUpdated,
}: ProductDialogProps) => {
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isAddMode = mode === 'add';

  const [formData, setFormData] = useState<Partial<ProductFormData>>({
    name: '',
    description: '',
    quantityKg: 1,
    pricePerKg: 0,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product && (isViewMode || isEditMode)) {
      setFormData({
        name: product.name,
        description: product.description,
        quantityKg: product.quantityKg,
        pricePerKg: product.pricePerKg,
      });
      setImagePreview(product.sampleImage ? `http://192.168.1.34:8081/uploads/images/${product.sampleImage}` : null);
    } else {
      setFormData({ name: '', description: '', quantityKg: 1, pricePerKg: 0 });
      setImagePreview(null);
    }
  }, [product, mode]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.pricePerKg || !formData.quantityKg) {
      toast({ title: 'Error', description: 'Please fill all required fields.', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);
      const productFormData = new FormData();
      productFormData.append('name', formData.name);
      productFormData.append('description', formData.description || '');
      productFormData.append('quantityKg', formData.quantityKg?.toString() || '1');
      productFormData.append('pricePerKg', formData.pricePerKg?.toString() || '0');
      if (formData.image) {
        productFormData.append('image', formData.image);
      }

      if (isEditMode && product?.id) {
        productFormData.append('id', product.id.toString());
        await productService.updateProduct(productFormData);
        toast({ title: 'Success', description: 'Product updated successfully!' });
      } else {
        await productService.createProduct(productFormData);
        toast({ title: 'Success', description: 'Product created successfully!' });
      }

      onOpenChange(false);
      onProductUpdated();
    } catch (error) {
      console.error('Failed to save product:', error);
      toast({ title: 'Error', description: 'Failed to save product.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isViewMode ? 'View Product' : isEditMode ? 'Edit Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Product Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              disabled={isViewMode}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              disabled={isViewMode}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Quantity (kg)</label>
              <Input
                type="number"
                value={formData.quantityKg}
                onChange={(e) => setFormData((prev) => ({ ...prev, quantityKg: parseFloat(e.target.value) }))}
                disabled={isViewMode}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Price (per kg)</label>
              <Input
                type="number"
                value={formData.pricePerKg}
                onChange={(e) => setFormData((prev) => ({ ...prev, pricePerKg: parseFloat(e.target.value) }))}
                disabled={isViewMode}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Product Image</label>
            {imagePreview && (
              <div className="mb-2">
                <img src={imagePreview} alt="Product" className="w-32 h-32 object-cover rounded" />
              </div>
            )}
            {!isViewMode && (
              <Input type="file" accept="image/*" onChange={handleImageChange} />
            )}
          </div>

          {!isViewMode && (
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : isEditMode ? 'Update Product' : 'Add Product'}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
