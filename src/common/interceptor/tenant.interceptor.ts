import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import type { Request } from 'express';
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const tenantId = request.headers['x-tenant'] as string;

    if (!tenantId) {
      throw new HttpException(
        {
          code: HttpStatus.BAD_REQUEST,
          message: 'Tenant ID is required',
          success: false,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: BigInt(tenantId) },
    });

    if (!tenant) {
      throw new HttpException(
        {
          code: HttpStatus.BAD_REQUEST,
          message: 'Invalid tenant ID',
          success: false,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return next.handle();
  }
}
