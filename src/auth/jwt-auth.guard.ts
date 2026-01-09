import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import 'dotenv/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    const tenantId: string | null | undefined = this.extractTenantId(
      request,
    ) as string | null | undefined;

    if (!token) {
      throw new UnauthorizedException({
        success: false,
        message: 'No token found',
        code: 'TOKEN_MISSING',
      });
    }

    try {
      const payload: any = await this.jwtService.verifyAsync(token, {
        secret: String(process.env.JWT_SECRET),
      });
      if (!tenantId) {
        throw new UnauthorizedException({
          success: false,
          message: 'No token found',
          code: 'TOKEN_MISSING',
        });
      }
      const user = await this.prismaService.user.findFirst({
        where: {
          id: BigInt(payload.userId),
          tenantId: BigInt(tenantId),
        },
        select: {
          authToken: true,
        },
      });

      if (!user || user.authToken != token) {
        throw new UnauthorizedException({
          success: false,
          message: 'Invalid token or user not found',
          code: 'TOKEN_INVALID',
        });
      }

      // attach payload to request
      request['user'] = payload;
      return true;
    } catch (err: any) {
      if (err?.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          success: false,
          message: 'Token expired',
          code: 'TOKEN_EXPIRED',
        });
      } else if (err?.response?.code == 'INVALID_TENANT') {
        throw new UnauthorizedException({ ...err.response });
      } else if (err?.response?.code == 'TOKEN_INVALID') {
        throw new UnauthorizedException({ ...err.response });
      } else
        throw new UnauthorizedException({
          success: false,
          message: 'Invalid token',
          code: 'TOKEN_INVALID',
          ...err,
        });
    }
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }

  private extractTenantId(request: Request) {
    return request.headers['x-tenant'];
  }
}
