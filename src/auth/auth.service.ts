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

    const authToken = await this.jwtService.signAsync({
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      userId: user.id.toString(),
    });

    await this.prisma.user.update({
      where: { email },
      data: {
        authToken,
      },
    });

    return {
      success: true,
      message: 'Login successful',
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
        id: String(user.id),
        tenant_id: String(user.tenantId),
      },
      authToken,
    };
  }
}
