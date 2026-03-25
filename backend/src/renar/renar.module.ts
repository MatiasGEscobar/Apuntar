import { Module } from '@nestjs/common';
import { RenarService } from './renar.service';

@Module({
  providers: [RenarService]
})
export class RenarModule {}
