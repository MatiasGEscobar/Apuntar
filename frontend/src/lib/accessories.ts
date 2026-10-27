import api from './api';

export type AccessoryCategory =
  | 'portacargador'
  | 'funda_pistolera'
  | 'ropa'
  | 'limpieza_mantenimiento'
  | 'optica_miras'
  | 'accesorios_varios'
  | 'otros';

export const ACCESSORY_CATEGORIES: { value: AccessoryCategory; label: string }[] = [
  { value: 'portacargador', label: 'Portacargadores' },
  { value: 'funda_pistolera', label: 'Fundas y pistoleras' },
  { value: 'ropa', label: 'Ropa de tiro' },
  { value: 'limpieza_mantenimiento', label: 'Limpieza y mantenimiento' },
  { value: 'optica_miras', label: 'Óptica y miras' },
  { value: 'accesorios_varios', label: 'Accesorios varios' },
  { value: 'otros', label: 'Otros' },
];

export const categoryLabel = (value: string) =>
  ACCESSORY_CATEGORIES.find((c) => c.value === value)?.label || value;

export interface Accessory {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  category: AccessoryCategory;
  condition: 'nuevo' | 'usado';
  price: number | string; // Postgres devuelve los decimales como string
  stock: number;
  images: string[];
  allowsShipping: boolean;
  allowsInPerson: boolean;
  city?: string;
  province?: string;
  isActive: boolean;
  views: number;
  createdAt: string;
}

export const accessoriesService = {
  async getAll(filters?: { category?: string; search?: string }): Promise<Accessory[]> {
    const response = await api.get<Accessory[]>('/accessories', { params: filters });
    return response.data;
  },

  async getById(id: string): Promise<Accessory> {
    const response = await api.get<Accessory>(`/accessories/${id}`);
    return response.data;
  },

  async create(data: Partial<Accessory>): Promise<Accessory> {
    const response = await api.post<Accessory>('/accessories', data);
    return response.data;
  },

  async getMine(): Promise<Accessory[]> {
    const response = await api.get<Accessory[]>('/accessories/seller/mine');
    return response.data;
  },
  
  async update(id: string, data: Partial<Accessory>): Promise<Accessory> {
    const response = await api.patch<Accessory>(`/accessories/${id}`, data);
    return response.data;
  },
  
  async remove(id: string): Promise<{ deleted: boolean }> {
    const response = await api.delete<{ deleted: boolean }>(`/accessories/${id}`);
    return response.data;
  },
  
  async getMySales(): Promise<AccessorySale[]> {
    const response = await api.get<AccessorySale[]>('/accessories/seller/sales');
    return response.data;
  },
  
  async fulfillOrder(orderId: string): Promise<void> {
    await api.patch(`/accessories/orders/${orderId}/fulfill`);
  },
};

export interface AccessorySale {
  id: string;
  accessoryId: string;
  accessoryName: string;
  accessoryImage: string | null;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  deliveryMethod: 'shipping' | 'in_person';
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingProvince: string | null;
  shippingPostalCode: string | null;
  quantity: number;
  amount: number | string;
  fulfilledAt: string | null;
  createdAt: string;
}