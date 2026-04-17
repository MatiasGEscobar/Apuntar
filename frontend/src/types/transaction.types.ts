import { Product } from './product.types';
import { User } from './user.types';

export enum TransactionStatus {
  PENDING = 'pending',
  ESCROW = 'escrow',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

export interface Transaction {
  id: string;
  productId: string;
  product: Product;
  buyerId: string;
  buyer: User;
  sellerId: string;
  seller: User;
  amount: number;
  buyerCommission: number;
  sellerCommission: number;
  totalCommission: number;
  status: TransactionStatus;
  mercadoPagoPaymentId?: string;
  mercadoPagoPreferenceId?: string;
  escrowReleaseDate?: string;
  buyerNotes?: string;
  sellerNotes?: string;
  buyerRating?: number;
  sellerRating?: number;
  buyerReview?: string;
  sellerReview?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  transactionId: string;
  senderId: string;
  sender: User;
  content: string;
  isRead: boolean;
  createdAt: string;
}