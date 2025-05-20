import { Inject, Injectable } from '@nestjs/common'
import { and, eq, sql } from 'drizzle-orm'

import { DB_CONN } from 'src/db/db.module'
import { Db } from 'src/db/db.connection'
import { DbTransaction } from 'src/db/db.transactions'
import { dancePresentationTable, danceScoringCriterionTable } from 'src/db/tables'
import { PostgresError } from 'postgres'

export type DanceGenre = 'Reguetón' | 'Calipso' | 'Joropo'

export type DanceCriterionScore = {
  criterion: string
  score: number
}

export type DancePresentation = {
  robotId: string
  genre: DanceGenre
  scorePerCriterion: DanceCriterionScore[]
}
export type DancePresentationCreation = Omit<DancePresentation, 'robotId'>
export type DancePresentationUpdate = Pick<DancePresentation, 'scorePerCriterion'>

export class DancePresentationServiceError extends Error {}
export class DancePresentationNotFoundError extends DancePresentationServiceError {}
export class DanceParticipantNotFoundError extends DancePresentationServiceError {}
export class CriterionNotFoundError extends DancePresentationServiceError {}
export class ScoreOutOfRangeError extends DancePresentationServiceError {
  constructor(
    readonly criterion: string,
    readonly minScore: number,
    readonly maxScore: number,
  ) {
    super()
  }
}
export class DancePresentationAlreadyExistsError extends DancePresentationServiceError {}

@Injectable()
export class DancePresentationService {
  constructor(
    @Inject(DB_CONN)
    private readonly db: Db
  ) {}

  async getPresentation(
    robotId: string,
    genre: DanceGenre,
    transaction?: DbTransaction,
  ): Promise<DancePresentation | undefined> {
    const db = transaction ?? this.db

    const [presentation] = await db
      .select({
        robotId: dancePresentationTable.robotId,
        genre: dancePresentationTable.genre,
        scorePerCriterion: sql<DanceCriterionScore[]>`
            json_agg(json_build_object(
              'criterion', ${dancePresentationTable.criterionName},
              'score', ${dancePresentationTable.criterionScore}
            ))
          `
          .as('score_per_criterion'),
      })
      .from(dancePresentationTable)
      .where(
        and(
          eq(dancePresentationTable.robotId, robotId),
          eq(dancePresentationTable.genre, genre),
        )
      )
      .groupBy(
        dancePresentationTable.robotId,
        dancePresentationTable.genre,
      )

    return presentation as (DancePresentation | undefined)
  }

  async getPresentations(
    robotId: string,
    transaction?: DbTransaction,
  ): Promise<DancePresentation[]> {
    const db = transaction ?? this.db

    const presentations = await db
      .select({
        robotId: dancePresentationTable.robotId,
        genre: dancePresentationTable.genre,
        scorePerCriterion: sql<DanceCriterionScore[]>`
            json_agg(json_build_object(
              'criterion', ${dancePresentationTable.criterionName},
              'score', ${dancePresentationTable.criterionScore}
            ))
          `
          .as('score_per_criterion'),
      })
      .from(dancePresentationTable)
      .where(eq(dancePresentationTable.robotId, robotId))
      .groupBy(
        dancePresentationTable.robotId,
        dancePresentationTable.genre,
      )
    
    return presentations as DancePresentation[]
  }

  async createPresentation(
    robotId: string,
    creationData: DancePresentationCreation,
    transaction?: DbTransaction
  ): Promise<DancePresentation> {
    const db = transaction ?? this.db

    await this.checkAbsenceOfAnyPresentationForGenre(robotId, creationData.genre, transaction)

    try {
      await db.insert(dancePresentationTable)
        .values(creationData.scorePerCriterion.map(criterionScore => ({
          robotId,
          genre: creationData.genre,
          criterionName: criterionScore.criterion,
          criterionScore: criterionScore.score,
        })))
    } catch (error) {
      // Check if the error is a foreign-key violation
      if (error instanceof PostgresError && error.code === '23503') {
        if (error.constraint_name?.includes(dancePresentationTable.robotId.name)) {
          throw new DanceParticipantNotFoundError(undefined, { cause: error })
        }
        if (error.constraint_name?.includes(dancePresentationTable.criterionName.name)) {
          throw new CriterionNotFoundError(undefined, { cause: error })
        }
      }
      throw error
    }

    const scores = await db
      .select({
        criterion: dancePresentationTable.criterionName,
        score: dancePresentationTable.criterionScore,
        minScore: danceScoringCriterionTable.minScore,
        maxScore: danceScoringCriterionTable.maxScore,
      })
      .from(dancePresentationTable)
      .innerJoin(
        danceScoringCriterionTable,
        eq(dancePresentationTable.criterionName, danceScoringCriterionTable.name)
      )
      .where(
        and(
          eq(dancePresentationTable.robotId, robotId),
          eq(dancePresentationTable.genre, creationData.genre),
        )
      )
    const outOfRangeScore = scores.find(s => s.score < s.minScore || s.score > s.maxScore)
    if (outOfRangeScore) {
      throw new ScoreOutOfRangeError(
        outOfRangeScore.criterion,
        outOfRangeScore.minScore,
        outOfRangeScore.maxScore
      )
    }
    
    return (await this.getPresentation(robotId, creationData.genre, transaction))!
  }

  async updatePresentation(
    robotId: string,
    genre: DanceGenre,
    updateData: DancePresentationUpdate,
    transaction?: DbTransaction
  ): Promise<DancePresentation> {
    await this.deletePresentation(robotId, genre, transaction)
    return await this.createPresentation(robotId, { genre, ...updateData }, transaction)
  }

  private async checkAbsenceOfAnyPresentationForGenre(
    robotId: string,
    genre: DanceGenre,
    transaction?: DbTransaction,
  ): Promise<void> {
    const db = transaction ?? this.db

    const entriesWithTheSameGenre = await db
      .select({
        robotId: dancePresentationTable.robotId,
      })
      .from(dancePresentationTable)
      .where(
        and(
          eq(dancePresentationTable.robotId, robotId),
          eq(dancePresentationTable.genre, genre),
        )
      )
    
    if (entriesWithTheSameGenre.length !== 0) {
      throw new DancePresentationAlreadyExistsError()
    }
  }

  async deletePresentation(
    robotId: string,
    genre: DanceGenre,
    transaction?: DbTransaction,
  ): Promise<void> {
    const db = transaction ?? this.db

    const [deletedPresentation] = await db.delete(dancePresentationTable)
      .where(
        and(
          eq(dancePresentationTable.robotId, robotId),
          eq(dancePresentationTable.genre, genre),
        )
      )
      .returning({ robotId: dancePresentationTable.robotId })
    if (!deletedPresentation) {
      throw new DancePresentationNotFoundError()
    }
  }
}
