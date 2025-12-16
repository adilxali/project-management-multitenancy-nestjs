import { Controller, Post, Body } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}
  @Post()
  async createTenant(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.createTenant(createTenantDto);
  }
}
