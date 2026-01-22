import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const Token = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const authToken = request.headers.authorization;
    if (!authToken) return null;
    const [type, token] = authToken.split(' ');

    return type === 'Bearer' ? token : null;
  },
);
