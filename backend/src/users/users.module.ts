import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/users.entity';
import { requiresAuth } from 'express-openid-connect';
import { RolesModule } from 'src/roles/roles.module';
import { FileUploadModule } from 'src/file-upload/file-upload.module';

@Module({
  imports:[TypeOrmModule.forFeature([User]), RolesModule, FileUploadModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService]
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(requiresAuth).forRoutes('users/profile');
  }
}