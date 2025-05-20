import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { PostgresError } from 'postgres'

import { DB_CONN } from 'src/db/db.module'
import { Db } from 'src/db/db.connection'
import { DbTransaction } from 'src/db/db.transactions'
import { DbRobot, robotTable } from 'src/db/tables'

export type Robot = DbRobot
export type RobotCreation = typeof robotTable.$inferInsert
export type RobotUpdate = Partial<RobotCreation>

export class RobotServiceError extends Error {}
export class RobotNotFoundError extends RobotServiceError {}
export class TeamNotFoundError extends RobotServiceError {}

@Injectable()
export class RobotService {
  constructor(
    @Inject(DB_CONN)
    private readonly db: Db
  ) {}

  async getRobot(
    id: string,
    transaction?: DbTransaction,
  ): Promise<Robot | undefined> {
    const db = transaction ?? this.db
    const [robot] = await db.select()
      .from(robotTable)
      .where(eq(robotTable.id, id))
    return robot
  }

  async getRobots(transaction?: DbTransaction): Promise<Robot[]> {
    const db = transaction ?? this.db
    return await db.select().from(robotTable)
  }

  async createRobot(
    creationData: RobotCreation,
    transaction?: DbTransaction,
  ): Promise<Robot> {
    const db = transaction ?? this.db

    let newRobot: DbRobot
    try {
      [newRobot] = await db.insert(robotTable)
        .values(creationData)
        .returning()
    } catch (error) {
      // Check if the error is a foreign-key violation
      // of the team ID
      if (
        error instanceof PostgresError
        && error.code === '23503'
        && error.constraint_name?.includes(robotTable.teamId.name)
      ) {
        throw new TeamNotFoundError(undefined, { cause: error })
      }
      throw error
    }

    return newRobot
  }

  async updateRobot(
    id: string,
    updateData: RobotUpdate,
    transaction?: DbTransaction,
  ): Promise<Robot> {
    const db = transaction ?? this.db

    let updatedRobot: DbRobot
    try {
      [updatedRobot] = await db.update(robotTable)
        .set(updateData)
        .where(eq(robotTable.id, id))
        .returning()
    } catch (error) {
      // Check if the error is a foreign-key violation
      // of the team ID
      if (
        error instanceof PostgresError
        && error.code === '23503'
        && error.constraint_name?.includes(robotTable.teamId.name)
      ) {
        throw new TeamNotFoundError(undefined, { cause: error })
      }
      throw error
    }
    
    if (!updatedRobot) {
      throw new RobotNotFoundError()
    }
    return updatedRobot
  }

  async deleteRobot(
    id: string,
    transaction?: DbTransaction,
  ): Promise<void> {
    const db = transaction ?? this.db
    const [deletedRobot] = await db.delete(robotTable)
      .where(eq(robotTable.id, id))
      .returning({ id: robotTable.id })
    if (!deletedRobot) {
      throw new RobotNotFoundError()
    }
  }
}
