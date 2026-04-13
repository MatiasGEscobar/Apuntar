import api from './api';
import { Product, CreateProductDto } from '../types/product.types';

export const productsService = {
  async getAll(params?: {
    category?: string;
    status?: string;
    search?: string;
  }): Promise<Product[]> {
    const response = await api.get<Product[]>('/products', { params });
    return response.data;
  },

  async getById(id: string): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  async create(data: CreateProductDto): Promise<Product> {
    const response = await api.post<Product>('/products', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateProductDto>): Promise<Product> {
    const response = await api.patch<Product>(`/products/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  async approve(id: string): Promise<Product> {
    const response = await api.patch<Product>(`/products/${id}/approve`);
    return response.data;
  },

  async reject(id: string, reason: string): Promise<Product> {
    const response = await api.patch<Product>(`/products/${id}/reject`, { reason });
    return response.data;
  },
};