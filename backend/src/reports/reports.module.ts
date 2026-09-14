import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { TransactionsModule } from '../transactions/transactions.module';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [TransactionsModule, CoursesModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}