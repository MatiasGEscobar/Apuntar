import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { TransactionsModule } from '../transactions/transactions.module';
import { CoursesModule } from '../courses/courses.module';
import { ProductsService } from '../products/products.service';

@Module({
  imports: [TransactionsModule, CoursesModule, ProductsService],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}