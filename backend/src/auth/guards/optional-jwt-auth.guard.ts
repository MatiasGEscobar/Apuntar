import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Sin token o con token inválido: sigue como invitado en vez de rechazar
  handleRequest(err: any, user: any) {
    return user || null;
  }
}