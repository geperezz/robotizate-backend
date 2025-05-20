import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'

import { DB_CONN } from 'src/db/db.module'
import { Db } from 'src/db/db.connection'
import { DbTransaction } from 'src/db/db.transactions'
import { danceScoringCriterionTable, DbDanceScoringCriterion } from 'src/db/tables'

export type DanceScoringCriterion = DbDanceScoringCriterion
export type DanceScoringCriterionCreation = typeof danceScoringCriterionTable.$inferInsert
export type DanceScoringCriterionUpdate = Partial<DanceScoringCriterionCreation>

export class DanceScoringCriterionServiceError extends Error {}
export class DanceScoringCriterionNotFoundError extends DanceScoringCriterionServiceError {}

@Injectable()
export class DanceScoringCriterionService {
  constructor(
    @Inject(DB_CONN)
    private readonly db: Db
  ) {}

  async getCriterion(name: string, transaction?: DbTransaction): Promise<DanceScoringCriterion | undefined> {
    const db = transaction ?? this.db
    const [criterion] = await db.select()
      .from(danceScoringCriterionTable)
      .where(eq(danceScoringCriterionTable.name, name))
    return criterion
  }

  async getCriteria(transaction?: DbTransaction): Promise<DanceScoringCriterion[]> {
    const db = transaction ?? this.db
    return await db.select().from(danceScoringCriterionTable)
  }

  async createCriterion(
    creationData: DanceScoringCriterionCreation,
    transaction?: DbTransaction,
  ): Promise<DanceScoringCriterion> {
    const db = transaction ?? this.db
    const [newCriterion] = await db
      .insert(danceScoringCriterionTable)
      .values(creationData)
      .returning()
    return newCriterion
  }

  async updateCriterion(
    name: string,
    updateData: DanceScoringCriterionUpdate,
    transaction?: DbTransaction,
  ): Promise<DanceScoringCriterion> {
    const db = transaction ?? this.db
    const [newCriterion] = await db
      .update(danceScoringCriterionTable)
      .set(updateData)
      .where(eq(danceScoringCriterionTable.name, name))
      .returning()
    if (!newCriterion) {
      throw new DanceScoringCriterionNotFoundError()
    }
    return newCriterion
  }

  async deleteCriterion(
    name: string,
    transaction?: DbTransaction,
  ): Promise<void> {
    const db = transaction ?? this.db
    const [deletedCriterion] = await db.delete(danceScoringCriterionTable)
      .where(eq(danceScoringCriterionTable.name, name))
      .returning({ name: danceScoringCriterionTable.name })
    if (!deletedCriterion) {
      throw new DanceScoringCriterionNotFoundError()
    }
  }
}
