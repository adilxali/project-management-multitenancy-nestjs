import { Controller, Post, Body, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import type { Request as req } from 'express';
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Request() request: req,
  ) {
    const tenantId = this.usersService.getTenantIdFromRequest(request);
    if (!tenantId) {
      throw new Error('Tenant ID is missing in the request headers');
    }
    return this.usersService.createUser({
      ...createUserDto,
      tenantId,
      role: 'USER' as 'USER' | 'ADMIN',
    });
  }
}
