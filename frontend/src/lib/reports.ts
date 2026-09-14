import api from './api';

export interface RevenueOverview {
  products: { totalSales: number; totalCommission: number; transactionCount: number };
  courses: { totalRevenue: number; platformCommission: number; academiaNet: number; enrollmentCount: number };
  platform: { totalCommission: number };
}

export interface RankingsOverview {
  topSellers: { sellerId: string; sellerName: string; salesCount: number; totalRevenue: number }[];
  mostViewedProducts: { id: string; name: string; views: number; price: number; images: string[]; seller: { firstName: string; lastName: string } }[];
  topCourses: { courseId: string; courseTitle: string; enrollmentCount: number; totalRevenue: number }[];
}

export const reportsService = {
  async getRevenue(): Promise<RevenueOverview> {
    const response = await api.get<RevenueOverview>('/reports/revenue');
    return response.data;
  },

  async getRankings(): Promise<RankingsOverview> {
    const response = await api.get<RankingsOverview>('/reports/rankings');
    return response.data;
  },
};