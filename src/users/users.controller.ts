import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Tenant } from 'src/common/decorators/tenant.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Get('')
  getUsers(@Tenant() tenantId: string) {
    return this.usersService.getTenantUsers(tenantId);
  }
}
