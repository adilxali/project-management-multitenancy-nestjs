import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const token = request.headers.authorization;
    const user = await PrismaService.user.findFirst({
      where: {
        id: token,
        tenantId: BigInt(data),
      },
      select: {
        authToken: true,
      },
    });
  },
);
