import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { Tenant } from 'src/common/decorators/tenant.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Get('')
  getUsers(@Tenant() tenantId: string) {
    return tenantId;
  }
}
