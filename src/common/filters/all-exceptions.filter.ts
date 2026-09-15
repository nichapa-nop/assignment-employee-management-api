import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { STATUS_CODES } from 'http';
import { ErrorResponseDto } from '../dto/error-response.dto';

const INTERNAL_ERROR_MESSAGE = 'Internal server error';

/**
 * Errors created by the `http-errors` package, e.g. thrown by body-parser
 * for oversized payloads (413) or unsupported charsets (415).
 */
interface HttpError extends Error {
  statusCode: number;
  expose?: boolean;
}

function isHttpError(exception: unknown): exception is HttpError {
  const statusCode = (exception as Partial<HttpError> | null)?.statusCode;
  return (
    exception instanceof Error &&
    typeof statusCode === 'number' &&
    statusCode >= 400 &&
    statusCode < 600
  );
}

/**
 * Converts every thrown exception into a consistent ErrorResponseDto body.
 * Unexpected errors are logged and returned as a generic 500 so internal
 * details never leak to the client.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    const statusCode = this.resolveStatus(exception);

    if (statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.originalUrl}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ErrorResponseDto = {
      statusCode,
      error: STATUS_CODES[statusCode] ?? 'Error',
      message: this.resolveMessage(exception),
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
    };

    response.status(statusCode).json(body);
  }

  private resolveStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    if (isHttpError(exception)) {
      return exception.statusCode;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private resolveMessage(exception: unknown): string | string[] {
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        return exceptionResponse;
      }

      const { message } = exceptionResponse as { message?: string | string[] };
      return message ?? exception.message;
    }

    if (isHttpError(exception) && exception.expose) {
      return exception.message;
    }

    return INTERNAL_ERROR_MESSAGE;
  }
}
