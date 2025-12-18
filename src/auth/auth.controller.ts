import { Controller, Body, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    return await this.authService.loginUser(email, password);
  }
}
