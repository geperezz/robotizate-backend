import { pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

import { schoolTable, teamStudentTable } from '.'

export const studentTable = pgTable('students', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  schoolId: uuid().notNull().references(() => schoolTable.id, { onUpdate: 'cascade', onDelete: 'restrict' })
})

export const studentTableRelations = relations(studentTable, ({ many }) => ({
  teamsStudents: many(teamStudentTable),
}))

export type DbStudent = typeof studentTable.$inferSelect