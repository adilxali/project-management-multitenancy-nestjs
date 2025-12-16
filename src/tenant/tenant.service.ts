import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async createTenant(createTenantDto: CreateTenantDto) {
    const { name, email } = createTenantDto;
    return await this.prisma.$transaction(async (tx) => {
      const existingTenant = await tx.tenant.findUnique({
        where: { email },
      });

      if (existingTenant) {
        throw new Error('Tenant with this email already exists');
      }
      const tenant = await tx.tenant.create({
        data: {
          name,
          email,
        },
      });
      const createdUser = await tx.user.create({
        data: {
          ...createTenantDto,
          role: 'ADMIN',
          tenantId: tenant.id,
        },
      });

      return {
        id: createdUser.id.toString(),
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
        tenantId: createdUser.tenantId.toString(),
        createdAt: createdUser.createdAt,
      };
    });
  }

  async getTenant(email: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { email },
    });
    return !!tenant;
  }

  async deleteAllTenants() {
    await this.prisma.$transaction([
      this.prisma.user.deleteMany(),
      this.prisma.tenant.deleteMany(),
    ]);
  }
}
