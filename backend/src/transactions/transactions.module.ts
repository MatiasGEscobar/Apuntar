import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { Transaction } from './entities/transaction.entity';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    ProductsModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService, TypeOrmModule],
})
export class TransactionsModule {}