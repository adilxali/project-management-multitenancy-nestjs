import { Injectable, NestMiddleware } from '@nestjs/common';
import { type Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const tenantId = req.headers['x-tenant'] as string;

    if (!tenantId) {
      res.status(400).json({
        code: 400,
        message: 'Tenant ID is required',
        success: false,
      });
      return;
    }

    next();
  }
}
