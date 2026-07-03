import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PaymentsModule } from './payments/payments.module';
import { ChatModule } from './chat/chat.module';
import { UploadModule } from './upload/upload.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RenarModule } from './renar/renar.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: false,
        ssl: configService.get('DATABASE_SSL') === 'true' ? {
      rejectUnauthorized: false,
      } : false,
      }), 
    }),   
    AuthModule,
    ProductsModule,
    TransactionsModule,
    PaymentsModule,
    ChatModule,
    UploadModule,
    NotificationsModule,
    RenarModule,
  ],
})
export class AppModule {}