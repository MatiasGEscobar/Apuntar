import { 
  Controller, 
  Get, 
  Patch, 
  Param, 
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole, UserStatus } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/approve')
  @Roles(UserRole.ADMIN)
  async approve(@Param('id') id: string) {
    return this.usersService.update(id, { 
      status: UserStatus.APPROVED,
      verifiedAt: new Date(),
    });
  }

  @Patch(':id/reject')
  @Roles(UserRole.ADMIN)
  async reject(@Param('id') id: string, @Body('reason') reason: string) {
    return this.usersService.update(id, { 
      status: UserStatus.REJECTED,
      rejectionReason: reason,
    });
  }

  @Patch(':id/suspend')
  @Roles(UserRole.ADMIN)
  async suspend(@Param('id') id: string, @Body('reason') reason: string) {
    return this.usersService.update(id, { 
      status: UserStatus.SUSPENDED,
      rejectionReason: reason,
    });
  }
}