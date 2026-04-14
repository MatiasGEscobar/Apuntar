export enum ProductCategory {
  PISTOLA = 'pistola',
  REVOLVER = 'revolver',
  RIFLE = 'rifle',
  ESCOPETA = 'escopeta',
  CARABINA = 'carabina',
}

export enum ProductCondition {
  NUEVO = 'nuevo',
  USADO_EXCELENTE = 'usado_excelente',
  USADO_BUENO = 'usado_bueno',
  USADO_REGULAR = 'usado_regular',
}

export enum ProductStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SOLD = 'sold',
  RESERVED = 'reserved',
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  brand: string;
  model: string;
  caliber: string;
  serialNumber: string;
  condition: ProductCondition;
  price: number;
  description: string;
  images: string[];
  city: string;
  province: string;
  postalCode?: string;
  status: ProductStatus;
  sellerId: string;
  seller?: {
    id: string;
    firstName: string;
    lastName: string;
    rating: number;
    totalSales: number;
  };
  views: number;
  favorites: number;
  rejectionReason?: string;  
  moderatedBy?: string;      
  moderatedAt?: string;   
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  category: ProductCategory;
  brand: string;
  model: string;
  caliber: string;
  serialNumber: string;
  condition: ProductCondition;
  price: number;
  description: string;
  images: string[];
  city: string;
  province: string;
  postalCode?: string;
}