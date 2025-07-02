
export interface Product {
  id: number;
  name: string;
  description?: string;
  quantityKg: number;
  remainingQuantityKg: number; // For displaying available stock
  pricePerKg: number;
  image: string;
  sampleImage?: string;
}

export interface ProductFormData {
  name: string;
  description?: string;
  quantityKg: number;
  pricePerKg: number;
  image: File;
}
