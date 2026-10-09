import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Accessory } from './entities/accessory.entity';
import { AccessoriesService } from './accessories.service';
import { AccessoriesController } from './accessories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Accessory])],
  controllers: [AccessoriesController],
  providers: [AccessoriesService],
  exports: [AccessoriesService],
})
export class AccessoriesModule {}