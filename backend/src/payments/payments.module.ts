import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TransactionsModule } from '../transactions/transactions.module';
import { CoursesModule } from '../courses/courses.module';
import { AccessoriesModule } from '../accessories/accessories.module';

@Module({
  imports: [TransactionsModule, CoursesModule, AccessoriesModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}