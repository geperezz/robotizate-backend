import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'

import { DB_CONN } from 'src/db/db.module'
import { Db } from 'src/db/db.connection'
import { DbTransaction } from 'src/db/db.transactions'
import { DbStudent, studentTable } from 'src/db/tables'

export type Student = DbStudent
export type StudentCreation = typeof studentTable.$inferInsert
export type StudentUpdate = Partial<StudentCreation>

export class StudentServiceError extends Error {}
export class StudentNotFoundError extends StudentServiceError {}

@Injectable()
export class StudentService {
  constructor(
    @Inject(DB_CONN)
    private readonly db: Db
  ) {}

  async getStudent(
    id: string,
    transaction?: DbTransaction,
  ): Promise<Student | undefined> {
    const db = transaction ?? this.db
    const [student] = await db.select()
      .from(studentTable)
      .where(eq(studentTable.id, id))
    return student
  }

  async getStudents(transaction?: DbTransaction): Promise<Student[]> {
    const db = transaction ?? this.db
    return await db.select().from(studentTable)
  }

  async createStudent(
    creationData: StudentCreation,
    transaction?: DbTransaction,
  ): Promise<Student> {
    const db = transaction ?? this.db
    const [newStudent] = await db.insert(studentTable)
      .values(creationData)
      .returning()
    return newStudent
  }

  async updateStudent(
    id: string,
    updateData: StudentUpdate,
    transaction?: DbTransaction,
  ): Promise<Student> {
    const db = transaction ?? this.db
    const [updatedStudent] = await db.update(studentTable)
      .set(updateData)
      .where(eq(studentTable.id, id))
      .returning()
    
    if (updatedStudent === undefined) {
      throw new StudentNotFoundError()
    }
    return updatedStudent
  }

  async deleteStudent(
    id: string,
    transaction?: DbTransaction,
  ): Promise<void> {
    const db = transaction ?? this.db
    const [deletedStudent] = await db.delete(studentTable)
      .where(eq(studentTable.id, id))
      .returning()
    if (deletedStudent === undefined) {
      throw new StudentNotFoundError()
    }
  }
}
