import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async loginUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { success: false, message: 'Invalid credentials' };
    }

    const accessToken = this.jwtService.sign({
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      userId: user.id.toString(),
      tenantId: user.tenantId.toString(),
    });

    return {
      success: true,
      message: 'Login successful',
      userId: user.id.toString(),
      accessToken,
    };
  }
}
