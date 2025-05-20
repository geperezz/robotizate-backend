import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

import { teamTable, studentTable } from '.'

export const teamStudentTable = pgTable('teams_students', {
  teamId: uuid().notNull().references(() => teamTable.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
  studentId: uuid().notNull().references(() => studentTable.id, { onUpdate: 'cascade', onDelete: 'restrict' }),
}, teamStudentTable => [
  primaryKey({ columns: [teamStudentTable.teamId, teamStudentTable.studentId] }),
])

export const teamStudentTableRelations = relations(teamStudentTable, ({ one }) => ({
  team: one(teamTable, {
    fields: [teamStudentTable.teamId],
    references: [teamTable.id]
  }),
  student: one(studentTable, {
    fields: [teamStudentTable.studentId],
    references: [studentTable.id]
  }),
}))

export type DbTeamStudent = typeof teamStudentTable.$inferSelect