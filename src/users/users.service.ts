import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    const tenantExists = await this.chechTenantExists(createUserDto.tenantId);
    if (!tenantExists) {
      throw new Error('Tenant does not exist');
    }
    const userExists = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (userExists) {
      throw new Error('User with this email already exists');
    }
    const hashPassword = await bcrypt.hash(
      createUserDto.password,
      process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10,
    );
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashPassword,
      },
    });
    return user;
  }

  private getTenantIdFromRequest(request: Request): number | null {
    const tenantId = request.headers['x-tenant-id'];
    if (tenantId && !Array.isArray(tenantId)) {
      return parseInt(tenantId, 10);
    }
    return null;
  }

  private chechTenantExists(tenantId: number): Promise<boolean> {
    return this.prisma.tenant
      .findUnique({ where: { id: tenantId } })
      .then((tenant) => !!tenant);
  }
}
