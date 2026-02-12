import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { Response } from 'express';

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handleKnownRequestError(error, response);
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Invalid request data',
        error: error.message,
      });
    }
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        success: false,
        message: 'Database connection failed',
      });
    }
    if (error instanceof Prisma.PrismaClientRustPanicError) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Database engine crashed',
      });
    }
    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Unknown database error',
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Unexpected server error',
      error: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }

  private handleKnownRequestError(
    error: Prisma.PrismaClientKnownRequestError,
    response: Response,
  ) {
    switch (error.code) {
      case 'P2002':
        return response.status(HttpStatus.CONFLICT).json({
          success: false,
          message: `Duplicate value ${error?.meta?.modelName}`,
        });

      case 'P2025':
        return response.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Record not found',
        });

      case 'P2003':
        return response.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Invalid foreign key reference',
        });

      case 'P2014':
        return response.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Relation constraint violation',
        });

      default:
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Database request error',
          code: error.code,
        });
    }
  }
}
