import { Controller, Post, Body, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, 
              private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Get('google')
@UseGuards(AuthGuard('google'))
async googleAuth() {
  // Inicia el flujo de Google OAuth
}

@Get('google/callback')
@UseGuards(AuthGuard('google'))
async googleAuthCallback(@Req() req, @Res() res) {
  const { access_token, user } = req.user;
  const frontendUrl = this.configService.get<string>('FRONTEND_URL');

  // Redirigir al frontend con el token
  res.redirect(
    `${frontendUrl}/auth/google/callback?token=${access_token}&user=${encodeURIComponent(JSON.stringify(user))}`
  );
}
}