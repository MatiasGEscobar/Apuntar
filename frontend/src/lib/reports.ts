import api from './api';

export interface RevenueOverview {
  products: { totalSales: number; totalCommission: number; transactionCount: number };
  courses: { totalRevenue: number; platformCommission: number; academiaNet: number; enrollmentCount: number };
  platform: { totalCommission: number };
}

export const reportsService = {
  async getRevenue(): Promise<RevenueOverview> {
    const response = await api.get<RevenueOverview>('/reports/revenue');
    return response.data;
  },
};