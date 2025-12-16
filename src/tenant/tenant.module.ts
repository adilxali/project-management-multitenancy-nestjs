import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [TenantService],
  controllers: [TenantController],
  imports: [UsersModule],
  exports: [TenantService],
})
export class TenantModule {}
