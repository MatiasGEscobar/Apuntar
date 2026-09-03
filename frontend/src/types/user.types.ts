export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  ADMIN = 'admin',
}

export enum UserStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  dni?: string;
  clu?: string;
  cluExpirationDate?: string;
  cuil?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  dniFrontUrl?: string;
  dniBackUrl?: string;
  cluFrontUrl?: string;
  cluBackUrl?: string;
  twoFactorEnabled?: boolean;
  rating?: number;
  totalSales?: number;
  totalPurchases?: number;
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  pendingCluExpirationDate?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dni: string;
  clu: string;
  cuil?: string;
  phone?: string;
  role: UserRole;
}