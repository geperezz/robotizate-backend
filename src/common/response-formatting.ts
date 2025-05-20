import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  SetMetadata,
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core'
import { Request, Response } from 'express'
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { stackTraceOf } from './error-strack-tracer'

export type SuccessfulResponse<T> = {
  path: string
  status: true
  statusCode: number
  message: string
  data: T
  timestamp: string
}

export type ErrorResponse = {
  path: string
  status: false
  statusCode: number
  message: string
  errors?: unknown[]
  timestamp: string
}

export const RESPONSE_MESSAGE = 'RESPONSE_MESSAGE'
 
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE, message)
 
@Injectable()
export class ResponseFormatterInterceptor<T> implements NestInterceptor<T, SuccessfulResponse<T>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessfulResponse<T>> {
    return next.handle().pipe(
      map((response: T) => this.formatResponse(response, context)),
    )
  }
 
  private formatResponse(originalResponse: T, context: ExecutionContext): SuccessfulResponse<T> {
    const httpContext = context.switchToHttp()
    const response = httpContext.getResponse()
    const request = httpContext.getRequest()
    const statusCode = response.statusCode
    const message =
      this.reflector.get<string>(
        RESPONSE_MESSAGE,
        context.getHandler(),
      ) || 'Success'

    return {
      path: request.url,
      status: true,
      statusCode,
      message: message,
      data: originalResponse,
      timestamp: new Date().toISOString(),
    }
  }
}

@Catch(Error)
export class ExceptionFormatterFilter implements ExceptionFilter {
  private readonly logger = new Logger(ExceptionFormatterFilter.name)

  catch(error: Error, host: ArgumentsHost): void {
    const httpContext = host.switchToHttp()
    const request = httpContext.getRequest<Request>()
    const response = httpContext.getResponse<Response>()

    if (!(error instanceof HttpException)) {
      this.logger.fatal(`Internal server error: ${stackTraceOf(error)}`)
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        path: request.url,
        status: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      })
      return
    }

    const responseBody: ErrorResponse = {
      path: request.url,
      status: false,
      statusCode: error.getStatus(),
      message: error.message,
      timestamp: new Date().toISOString(),
    }

    const errorDetails = error.getResponse()
    if (
      typeof errorDetails !== 'string'
      && 'errors' in errorDetails
      && Array.isArray(errorDetails.errors)
    ) {
      responseBody.errors = errorDetails.errors
    }

    response.status(responseBody.statusCode).json(responseBody)
  }
}