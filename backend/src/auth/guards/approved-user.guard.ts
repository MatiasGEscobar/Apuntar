import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserStatus } from '../../users/entities/user.entity';

@Injectable()
export class ApprovedUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (user.status !== UserStatus.APPROVED) {
      throw new ForbiddenException(
        'Tu cuenta está pendiente de aprobación. Por favor, sube tus documentos y espera la verificación del administrador.'
      );
    }

    return true;
  }
}