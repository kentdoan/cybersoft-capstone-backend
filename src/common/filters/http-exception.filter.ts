import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from 'generated/prisma/client';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const res = exceptionResponse as Record<string, any>;
        message = Array.isArray(res.message)
          ? res.message.join(', ')
          : (res.message ?? message);
      }
    } else if (
      exception instanceof Prisma.PrismaClientKnownRequestError &&
      exception.code === 'P2002' //Unique constraint failed on the {constraint}
    ) {
      statusCode = HttpStatus.CONFLICT; //409
      let targetName = 'Data';
      const meta = exception.meta as any;
      const fields = meta?.driverAdapterError?.cause?.constraint?.fields || meta?.target;

      if (Array.isArray(fields)) {
        targetName = fields.join(', ');
      } else if (typeof fields === 'string') {
        targetName = fields;
      }
      
      message = `${targetName} already exists in the system`; 
    } else if (
      exception instanceof Prisma.PrismaClientKnownRequestError &&
      exception.code === 'P2025' //An operation failed because it depends on one or more records that were required but not found. {cause}
    ) {
      statusCode = HttpStatus.NOT_FOUND; //404
      message = 'Data Not Found';
    } else {
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(statusCode).json({
      statusCode,
      message,
      content: null,
      dateTime: new Date().toISOString(),
    });
  }
}
