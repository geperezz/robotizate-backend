import { Module } from '@nestjs/common'

import { db } from './db.connection'

export const DB_CONN = Symbol('DB_CONN')

@Module({
  providers: [
    {
      provide: DB_CONN,
      useValue: db,
    }
  ],
  exports: [DB_CONN],
})
export class DbModule {}
