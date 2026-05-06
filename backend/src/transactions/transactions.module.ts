import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { Transaction } from './entities/transaction.entity';
import { ProductsModule } from '../products/products.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { NotificationsService } from '../notifications/notifications.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    ProductsModule, NotificationsModule
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, NotificationsService],
  exports: [TransactionsService, TypeOrmModule],
})
export class TransactionsModule {}