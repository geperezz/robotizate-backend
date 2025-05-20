import { Inject, Injectable } from '@nestjs/common'
import { eq, inArray } from 'drizzle-orm'
import { PostgresError } from 'postgres'

import { DB_CONN } from 'src/db/db.module'
import { Db } from 'src/db/db.connection'
import { DbTransaction } from 'src/db/db.transactions'
import { DbTeam, studentTable, teacherTable, teamStudentTable, teamTable } from 'src/db/tables'
import { omit } from 'src/common/property-omitter'
import { Student } from 'src/students/student.service'
import { Teacher } from 'src/teachers/teacher.service'

export type TeamTeacher = Omit<Teacher, 'schoolId'>
export type TeamStudent = Omit<Student, 'schoolId'>
export type Team = Omit<DbTeam, 'teacherInChargeId'> & {
  teacherInCharge: TeamTeacher
  students: TeamStudent[]
}
export type TeamCreation = (typeof teamTable.$inferInsert) & {
  studentIds: string[]
}
export type TeamUpdate = Partial<Omit<TeamCreation, 'schoolId'>>

export class TeamServiceError extends Error {}
export class SchoolNotFoundError extends TeamServiceError {}
export class TeacherNotFoundError extends TeamServiceError {}
export class TeamNotFoundError extends TeamServiceError {}
export class StudentNotFoundError extends TeamServiceError {}
export class InvalidCaptainError extends TeamServiceError {}
export class InvalidTeacherSchoolError extends TeamServiceError {
  constructor(
    readonly expectedSchoolId: string,
    readonly actualSchoolId: string
  ) {
    super()
  }
}
export class InvalidStudentSchoolError extends TeamServiceError {
  constructor(
    readonly studentId: string,
    readonly expectedSchoolId: string,
    readonly actualSchoolId: string
  ) {
    super()
  }
}

@Injectable()
export class TeamService {
  constructor(
    @Inject(DB_CONN)
    private readonly db: Db
  ) {}

  async getTeam(
    id: string,
    transaction?: DbTransaction,
  ): Promise<Team | undefined> {
    const db = transaction ?? this.db

    const dbTeam = await db.query.teamTable.findFirst({
      columns: { teacherInChargeId: false },
      with: {
        teacherInCharge: { columns: { schoolId: false } },
        teamsStudents: {
          columns: {},
          with: { student: { columns: { schoolId: false } } },
        },
      },
      where: eq(teamTable.id, id),
    })

    if (!dbTeam) {
      return undefined
    }
    return {
      ...omit(dbTeam, ['teamsStudents']),
      students: dbTeam.teamsStudents.map(ts => ts.student),
    }
  }

  async getTeams(transaction?: DbTransaction): Promise<Team[]> {
    const db = transaction ?? this.db

    const dbTeams = await db.query.teamTable.findMany({
      columns: { teacherInChargeId: false },
      with: {
        teacherInCharge: { columns: { schoolId: false } },
        teamsStudents: {
          columns: {},
          with: { student: { columns: { schoolId: false } } },
        },
      },
    })

    return dbTeams.map(team => ({
      ...omit(team, ['teamsStudents']),
      students: team.teamsStudents.map(ts => ts.student),
    }))
  }

  async createTeam(
    creationData: TeamCreation,
    transaction?: DbTransaction,
  ): Promise<Team> {
    const db = transaction ?? this.db

    let newTeamId: string
    try {
      [{ newTeamId }] = await db.insert(teamTable)
        .values(omit(creationData, ['studentIds']))
        .returning({ newTeamId: teamTable.id })
    } catch (error) {
      // Check if the error is a foreign-key violation
      if (error instanceof PostgresError && error.code === '23503') {
        if (error.constraint_name?.includes(teamTable.schoolId.name)) {
          throw new SchoolNotFoundError(undefined, { cause: error })
        }
        if (error.constraint_name?.includes(teamTable.teacherInChargeId.name)) {
          throw new TeacherNotFoundError(undefined, { cause: error })
        }
      }
      throw error
    }

    await this.checkTeacherSchool(
      creationData.teacherInChargeId,
      creationData.schoolId,
      db,
    )

    try {
      await db.insert(teamStudentTable)
        .values(creationData.studentIds.map(
          studentId => ({ teamId: newTeamId, studentId })
        ))
    } catch (error) {
      // Check if the error is a foreign-key violation
      // of the student ID
      if (
        error instanceof PostgresError
        && error.code === '23503'
        && error.constraint_name?.includes(teamStudentTable.studentId.name)
      ) {
        throw new StudentNotFoundError(undefined, { cause: error })
      }
      throw error
    }

    await this.checkEachStudentSchool(
      creationData.studentIds,
      creationData.schoolId,
      db,
    )
    
    if (!(creationData.studentIds.includes(creationData.captainId))) {
      throw new InvalidCaptainError()
    }
    
    return (await this.getTeam(newTeamId, transaction))!
  }

  async updateTeam(
    id: string,
    updateData: TeamUpdate,
    transaction?: DbTransaction,
  ): Promise<Team> {
    const db = transaction ?? this.db

    let newDbTeam: DbTeam | undefined
    try {
      [newDbTeam] = await db.update(teamTable)
        .set(omit(updateData, ['studentIds']))
        .where(eq(teamTable.id, id))
        .returning()
    } catch (error) {
      // Check if the error is a foreign-key violation
      // of the ID of the teacher in charge
      if (
        error instanceof PostgresError
        && error.code === '23503'
        && error.constraint_name?.includes(teamTable.teacherInChargeId.name)
      ) {
        throw new TeacherNotFoundError(undefined, { cause: error })
      }
      throw error
    }
    if (!newDbTeam) {
      throw new TeamNotFoundError()
    }

    if (updateData.teacherInChargeId) {
      await this.checkTeacherSchool(
        updateData.teacherInChargeId,
        newDbTeam.schoolId,
        db,
      )
    }

    if (updateData.studentIds && updateData.studentIds.length) {
      await db.delete(teamStudentTable)
        .where(eq(teamStudentTable.teamId, newDbTeam.id))
      
      try {
        await db.insert(teamStudentTable)
          .values(updateData.studentIds.map(
            studentId => ({ teamId: newDbTeam.id, studentId })
          ))
      } catch (error) {
        // Check if the error is a foreign-key violation
        // of the Student ID
        if (
          error instanceof PostgresError
          && error.code === '23503'
          && error.constraint_name?.includes(teamStudentTable.studentId.name)
        ) {
          throw new StudentNotFoundError(undefined, { cause: error })
        }
        throw error
      }

      await this.checkEachStudentSchool(
        updateData.studentIds,
        newDbTeam.schoolId,
        db,
      )
    }

    const newTeam = (await this.getTeam(newDbTeam.id, transaction))!
    if (!newTeam.students.some(s => s.id === newTeam.captainId)) {
      throw new InvalidCaptainError()
    }
    return newTeam
  }

  private async checkTeacherSchool(
    teacherId: string,
    expectedSchoolId: string,
    db: Db | DbTransaction
  ): Promise<void> {
    const [teacher] = await db.select({ schoolId: teacherTable.schoolId })
      .from(teacherTable)
      .where(eq(teacherTable.id, teacherId))

    if (teacher.schoolId !== expectedSchoolId) {
      throw new InvalidTeacherSchoolError(expectedSchoolId, teacher.schoolId)
    }
  }

  private async checkEachStudentSchool(
    studentIds: string[],
    expectedSchoolId: string,
    db: Db | DbTransaction
  ): Promise<void> {
    const students = await db
      .select({
        id: studentTable.id,
        schoolId: studentTable.schoolId,
      })
      .from(studentTable)
      .where(inArray(studentTable.id, studentIds))

    const foreignStudent = students.find(student => student.schoolId !== expectedSchoolId)
    if (foreignStudent) {
      throw new InvalidStudentSchoolError(
        foreignStudent.id,
        expectedSchoolId,
        foreignStudent.schoolId,
      )
    }
  }

  async deleteTeam(
    id: string,
    transaction?: DbTransaction,
  ): Promise<void> {
    const db = transaction ?? this.db
    const [deletedDbTeam] = await db.delete(teamTable)
      .where(eq(teamTable.id, id))
      .returning({ id: teamTable.id })
    if (!deletedDbTeam) {
      throw new TeamNotFoundError()
    }
  }
}
