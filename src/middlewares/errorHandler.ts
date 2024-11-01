import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  ValidationError,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ErrorHandler');

  catch(exception: HttpException, host: ArgumentsHost) {
    if (host.getType() === 'http' && exception instanceof HttpException) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const status = exception.getStatus();
      const message = exception.message;

      response.status(status).json({
        statusCode: status,
        message,
        exception:
          process.env.NODE_ENV === 'staging' ? JSON.stringify(exception) : '',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export const ValidatorErrorHandler = {
  exceptionFactory: (errors: ValidationError[]) => {
    const result = errors.map((error) => {
      let message;
      if (error?.children?.[0]?.children?.length) {
        message = Object.values(
          error?.children?.[0]?.children?.[0]?.constraints || {},
        )[0];
      } else {
        message = Object.values(error.constraints || {})[0];
      }

      return { property: error.property, message };
    });

    return new UnprocessableEntityException(result[0].message);
  },

  whitelist: true,
  stopAtFirstError: true,
};
