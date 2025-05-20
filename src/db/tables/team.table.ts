import { pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

import { schoolTable, teacherTable, teamStudentTable } from '.'

export const teamTable = pgTable('teams', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  schoolId: uuid().notNull().references(() => schoolTable.id, { onUpdate: 'cascade', onDelete: 'restrict' }),
  captainId: uuid().notNull(),
  teacherInChargeId: uuid().notNull().references(() => teacherTable.id, { onUpdate: 'cascade', onDelete: 'restrict' }),
})

export const teamTableRelations = relations(teamTable, ({ one, many }) => ({
  teacherInCharge: one(teacherTable, {
    fields: [teamTable.teacherInChargeId],
    references: [teacherTable.id]
  }),
  teamsStudents: many(teamStudentTable),
}))

export type DbTeam = typeof teamTable.$inferSelect