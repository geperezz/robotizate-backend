import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'

import { DB_CONN } from 'src/db/db.module'
import { Db } from 'src/db/db.connection'
import { DbTransaction } from 'src/db/db.transactions'
import { DbSchool, schoolTable } from 'src/db/tables'

export type School = DbSchool
export type SchoolCreation = typeof schoolTable.$inferInsert
export type SchoolUpdate = Partial<SchoolCreation>

export class SchoolServiceError extends Error {}
export class SchoolNotFoundError extends SchoolServiceError {}

@Injectable()
export class SchoolService {
  constructor(
    @Inject(DB_CONN)
    private readonly db: Db
  ) {}

  async getSchool(
    id: string,
    transaction?: DbTransaction,
  ): Promise<School | undefined> {
    const db = transaction ?? this.db
    const [school] = await db.select()
      .from(schoolTable)
      .where(eq(schoolTable.id, id))
    return school
  }

  async getSchools(transaction?: DbTransaction): Promise<School[]> {
    const db = transaction ?? this.db
    return await db.select().from(schoolTable)
  }

  async createSchool(
    creationData: SchoolCreation,
    transaction?: DbTransaction,
  ): Promise<School> {
    const db = transaction ?? this.db
    const [newSchool] = await db.insert(schoolTable)
      .values(creationData)
      .returning()
    return newSchool
  }

  async updateSchool(
    id: string,
    updateData: SchoolUpdate,
    transaction?: DbTransaction,
  ): Promise<School> {
    const db = transaction ?? this.db
    const [updatedSchool] = await db.update(schoolTable)
      .set(updateData)
      .where(eq(schoolTable.id, id))
      .returning()
    
    if (updatedSchool === undefined) {
      throw new SchoolNotFoundError()
    }
    return updatedSchool
  }

  async deleteSchool(
    id: string,
    transaction?: DbTransaction,
  ): Promise<void> {
    const db = transaction ?? this.db
    const [deletedSchool] = await db.delete(schoolTable)
      .where(eq(schoolTable.id, id))
      .returning()
    if (deletedSchool === undefined) {
      throw new SchoolNotFoundError()
    }
  }
}
