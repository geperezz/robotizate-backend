import { Inject, Injectable } from '@nestjs/common'
import { eq, getTableColumns, sql } from 'drizzle-orm'
import { PostgresError } from 'postgres'

import { DB_CONN } from 'src/db/db.module'
import { Db } from 'src/db/db.connection'
import { DbTransaction } from 'src/db/db.transactions'
import { danceParticipantTable, dancePresentationTable, DbDanceParticipant, DbRobot, robotTable, teamStudentTable, teamTable } from 'src/db/tables'
import { omit } from 'src/common/property-omitter'

export type DanceCriterionScore = {
  criterion: string
  score: number
}
export type DanceParticipant = Omit<DbRobot, 'id'> & DbDanceParticipant & {
  rank: number
  totalScore: number
  scorePerCriterion: DanceCriterionScore[]
}
export type DanceParticipantCreation = DbDanceParticipant

export class DanceParticipantServiceError extends Error {}
export class DanceParticipantNotFoundError extends DanceParticipantServiceError {}
export class RobotNotFoundError extends DanceParticipantServiceError {}

@Injectable()
export class DanceParticipantService {
  constructor(
    @Inject(DB_CONN)
    private readonly db: Db
  ) {}

  async getParticipant(robotId: string, transaction?: DbTransaction): Promise<DanceParticipant | undefined> {
    const db = transaction ?? this.db

    const criteriaScores = await db.$with('criteria_scores').as(db
      .select({
        robotId: danceParticipantTable.robotId,
        criterionName: dancePresentationTable.criterionName,
        criterionScore: sql`COALESCE(SUM(${dancePresentationTable.criterionScore}), 0)`
          .mapWith(Number)
          .as('score'),
      })
      .from(danceParticipantTable)
      .leftJoin(
        dancePresentationTable,
        eq(danceParticipantTable.robotId, dancePresentationTable.robotId),
      )
      .where(eq(danceParticipantTable.robotId, robotId))
      .groupBy(danceParticipantTable.robotId, dancePresentationTable.criterionName)
    )
    
    const participantScores = await db.$with('participant_scores').as(db
      .select({
        robotId: criteriaScores.robotId,
        totalScore: sql`COALESCE(SUM(${criteriaScores.criterionScore}), 0)`
          .mapWith(Number)
          .as('total_score'),
        scorePerCriterion: sql<DanceCriterionScore[]>`json_agg(json_build_object(
            'criterion', ${criteriaScores.criterionName},
            'score', ${criteriaScores.criterionScore}
          ))`
          .as('score_per_criterion'),
      })
      .from(criteriaScores)
      .groupBy(criteriaScores.robotId)
    )

    const [participant] = await db.with(criteriaScores, participantScores)
      .select({
        ...getTableColumns(danceParticipantTable),
        ...omit(getTableColumns(robotTable), ['id']),
        rank: sql`ROW_NUMBER() OVER (ORDER BY ${participantScores.totalScore} DESC)`
          .mapWith(Number)
          .as('rank'),
        totalScore: participantScores.totalScore,
        scorePerCriterion: participantScores.scorePerCriterion,
      })
      .from(danceParticipantTable)
      .innerJoin(participantScores, eq(danceParticipantTable.robotId, participantScores.robotId))
      .innerJoin(robotTable, eq(danceParticipantTable.robotId, robotTable.id))

    return participant
  }

  async getParticipants(transaction?: DbTransaction): Promise<DanceParticipant[]> {
    const db = transaction ?? this.db

    const criteriaScores = await db.$with('criteria_scores').as(db
      .select({
        robotId: danceParticipantTable.robotId,
        criterionName: dancePresentationTable.criterionName,
        criterionScore: sql`COALESCE(SUM(${dancePresentationTable.criterionScore}), 0)`
          .mapWith(Number)
          .as('score'),
      })
      .from(danceParticipantTable)
      .leftJoin(
        dancePresentationTable,
        eq(danceParticipantTable.robotId, dancePresentationTable.robotId),
      )
      .groupBy(danceParticipantTable.robotId, dancePresentationTable.criterionName)
    )
    
    const participantScores = await db.$with('participant_scores').as(db
      .select({
        robotId: criteriaScores.robotId,
        totalScore: sql`COALESCE(SUM(${criteriaScores.criterionScore}), 0)`
          .mapWith(Number)
          .as('total_score'),
        scorePerCriterion: sql<DanceCriterionScore[]>`
            CASE
              WHEN COUNT(${criteriaScores.criterionName}) <> 0 THEN
                json_agg(json_build_object(
                  'criterion', ${criteriaScores.criterionName},
                  'score', ${criteriaScores.criterionScore}
                ))
            ELSE
              '[]'::json
            END
          `
          .as('score_per_criterion'),
      })
      .from(criteriaScores)
      .groupBy(criteriaScores.robotId)
    )

    const participants = await db.with(criteriaScores, participantScores)
      .select({
        ...getTableColumns(danceParticipantTable),
        ...omit(getTableColumns(robotTable), ['id']),
        rank: sql`ROW_NUMBER() OVER (ORDER BY ${participantScores.totalScore} DESC)`
          .mapWith(Number)
          .as('rank'),
        totalScore: participantScores.totalScore,
        scorePerCriterion: participantScores.scorePerCriterion,
      })
      .from(danceParticipantTable)
      .innerJoin(participantScores, eq(danceParticipantTable.robotId, participantScores.robotId))
      .innerJoin(robotTable, eq(danceParticipantTable.robotId, robotTable.id))

    return participants
  }

  async createParticipant(
    creationData: DanceParticipantCreation,
    transaction?: DbTransaction,
  ): Promise<DanceParticipant> {
    const db = transaction ?? this.db

    try {
      await db.insert(danceParticipantTable).values(creationData)
    } catch (error) {
      // Check if the error is a foreign-key violation
      // of the robot ID
      if (
        error instanceof PostgresError
        && error.code === '23503'
        && error.constraint_name?.includes(danceParticipantTable.robotId.name)
      ) {
        throw new RobotNotFoundError(undefined, { cause: error })
      }
      throw error
    }

    return (await this.getParticipant(creationData.robotId, transaction))!
  }

  async deleteParticipant(
    robotId: string,
    transaction?: DbTransaction,
  ): Promise<void> {
    const db = transaction ?? this.db

    const [deletedRobot] = await db.delete(danceParticipantTable)
      .where(eq(danceParticipantTable.robotId, robotId))
      .returning({ robotId: danceParticipantTable.robotId })
    if (!deletedRobot) {
      throw new DanceParticipantNotFoundError()
    }
  }
}
