import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'

import { DB_CONN } from 'src/db/db.module'
import { Db } from 'src/db/db.connection'
import { DbTransaction } from 'src/db/db.transactions'
import { DbTeacher, teacherTable } from 'src/db/tables'

export type Teacher = DbTeacher
export type TeacherCreation = typeof teacherTable.$inferInsert
export type TeacherUpdate = Partial<TeacherCreation>

export class TeacherServiceError extends Error {}
export class TeacherNotFoundError extends TeacherServiceError {}

@Injectable()
export class TeacherService {
  constructor(
    @Inject(DB_CONN)
    private readonly db: Db
  ) {}

  async getTeacher(
    id: string,
    transaction?: DbTransaction,
  ): Promise<Teacher | undefined> {
    const db = transaction ?? this.db
    const [teacher] = await db.select()
      .from(teacherTable)
      .where(eq(teacherTable.id, id))
    return teacher
  }

  async getTeachers(transaction?: DbTransaction): Promise<Teacher[]> {
    const db = transaction ?? this.db
    return await db.select().from(teacherTable)
  }

  async createTeacher(
    creationData: TeacherCreation,
    transaction?: DbTransaction,
  ): Promise<Teacher> {
    const db = transaction ?? this.db
    const [newTeacher] = await db.insert(teacherTable)
      .values(creationData)
      .returning()
    return newTeacher
  }

  async updateTeacher(
    id: string,
    updateData: TeacherUpdate,
    transaction?: DbTransaction,
  ): Promise<Teacher> {
    const db = transaction ?? this.db
    const [updatedTeacher] = await db.update(teacherTable)
      .set(updateData)
      .where(eq(teacherTable.id, id))
      .returning()
    
    if (updatedTeacher === undefined) {
      throw new TeacherNotFoundError()
    }
    return updatedTeacher
  }

  async deleteTeacher(
    id: string,
    transaction?: DbTransaction,
  ): Promise<void> {
    const db = transaction ?? this.db
    const [deletedTeacher] = await db.delete(teacherTable)
      .where(eq(teacherTable.id, id))
      .returning()
    if (deletedTeacher === undefined) {
      throw new TeacherNotFoundError()
    }
  }
}
