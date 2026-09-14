import { Injectable } from '@nestjs/common';
import { TransactionsService } from '../transactions/transactions.service';
import { CoursesService } from '../courses/courses.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class ReportsService {
  constructor(
    private transactionsService: TransactionsService,
    private coursesService: CoursesService,
    private productsService: ProductsService,
  ) {}

  async getRevenueOverview() {
    const products = await this.transactionsService.getRevenueSummary();
    const courses = await this.coursesService.getRevenueSummary();

    return {
      products,
      courses,
      platform: {
        totalCommission: products.totalCommission + courses.platformCommission,
      },
    };
  }

  async getRankings() {
  const [topSellers, mostViewedProducts, topCourses] = await Promise.all([
    this.transactionsService.getTopSellers(10),
    this.productsService.getMostViewed(10),
    this.coursesService.getTopCourses(10),
  ]);
  return { topSellers, mostViewedProducts, topCourses };
}
}