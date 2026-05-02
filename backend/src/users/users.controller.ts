import { 
  Controller, 
  Get, 
  Patch, 
  Param, 
  Body,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole, UserStatus } from './entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService,  private readonly notificationsService: NotificationsService) {}

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

  // ← AGREGAR ESTE MÉTODO
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<any>,
    @Request() req,
  ) {
    // Solo el propio usuario o admin puede actualizar
    if (req.user.id !== id && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('No tienes permiso para actualizar este usuario');
    }

    return this.usersService.update(id, updateData);
  }

  @Patch(':id/approve')
  @Roles(UserRole.ADMIN)
  async approve(@Param('id') id: string, @Request() req) {
    const user = await this.usersService.update(id, { 
      status: UserStatus.APPROVED,
      verifiedAt: new Date(),
      verifiedBy: req.user.id,
    });
  
      // ← ENVIAR EMAIL
    await this.notificationsService.sendUserApprovedEmail(user);

    return user;
  }

  @Patch(':id/reject')
  @Roles(UserRole.ADMIN)
  async reject(@Param('id') id: string, @Body('reason') reason: string) {
    const user = await this.usersService.update(id, { 
      status: UserStatus.REJECTED,
      rejectionReason: reason,
    });
     // ← ENVIAR EMAIL
    await this.notificationsService.sendUserRejectedEmail(user, reason);

    return user;
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