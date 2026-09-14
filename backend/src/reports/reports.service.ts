import { Injectable } from '@nestjs/common';
import { TransactionsService } from '../transactions/transactions.service';
import { CoursesService } from '../courses/courses.service';

@Injectable()
export class ReportsService {
  constructor(
    private transactionsService: TransactionsService,
    private coursesService: CoursesService,
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
}