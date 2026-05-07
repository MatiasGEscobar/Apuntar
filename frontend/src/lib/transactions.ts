import api from './api';
import { Transaction } from '../types/transaction.types';

export const transactionsService = {
  async create(productId: string): Promise<Transaction> {
    const response = await api.post<Transaction>('/transactions', { productId });
    return response.data;
  },

  async getAll(): Promise<Transaction[]> {
    const response = await api.get<Transaction[]>('/transactions');
    return response.data;
  },

  async getMyTransactions(): Promise<Transaction[]> {
    const response = await api.get<Transaction[]>('/transactions/my-transactions');
    return response.data;
  },

  async getById(id: string): Promise<Transaction> {
    const response = await api.get<Transaction>(`/transactions/${id}`);
    return response.data;
  },

  async confirmPayment(id: string, paymentId: string, preferenceId: string): Promise<Transaction> {
    const response = await api.patch<Transaction>(`/transactions/${id}/confirm-payment`, {
      paymentId,
      preferenceId,
    });
    return response.data;
  },

  async createPaymentPreference(
  transactionId: string,
  buyerEmail: string,
  productTitle: string,
): Promise<{ preferenceId: string; initPoint: string; sandboxInitPoint: string }> {
  const response = await api.post(`/payments/create-preference/${transactionId}`, {
    buyerEmail,
    productTitle,
  });
  return response.data;
},

  async confirmDelivery(id: string): Promise<Transaction> {
    const response = await api.patch<Transaction>(`/transactions/${id}/confirm-delivery`);
    return response.data;
  },

  async cancel(id: string, reason: string): Promise<Transaction> {
    const response = await api.patch<Transaction>(`/transactions/${id}/cancel`, { reason });
    return response.data;
  },

  async addRating(id: string, rating: number, review?: string): Promise<Transaction> {
    const response = await api.patch<Transaction>(`/transactions/${id}/rating`, {
      rating,
      review,
    });
    return response.data;
  },
};