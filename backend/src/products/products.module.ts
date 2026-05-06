import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { NotificationsService } from '../notifications/notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), NotificationsModule],
  controllers: [ProductsController],
  providers: [ProductsService, NotificationsService],
  exports: [ProductsService, TypeOrmModule],
})
export class ProductsModule {}