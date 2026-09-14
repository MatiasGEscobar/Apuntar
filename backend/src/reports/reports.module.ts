import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { TransactionsModule } from '../transactions/transactions.module';
import { CoursesModule } from '../courses/courses.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [TransactionsModule, CoursesModule, ProductsModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}