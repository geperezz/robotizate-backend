import { CallHandler, createParamDecorator, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common'
import { lastValueFrom, Observable, of } from 'rxjs'

import { DB_CONN } from './db.module'
import { Db } from './db.connection'

export type DbTransaction = Parameters<Parameters<Db['transaction']>[0]>[0]

@Injectable()
export class TransactionInterceptor implements NestInterceptor<unknown, unknown> {
  constructor(
    @Inject(DB_CONN)
    private readonly db: Db
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const response = await this.db.transaction(async transaction => {
      const request = context.switchToHttp().getRequest()
      request.transaction = transaction

      return await lastValueFrom(next.handle())
    })
    return of(response)
  }
}

export const Transaction = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()
    return request.transaction
  }
)
