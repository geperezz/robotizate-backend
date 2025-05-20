import { pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

import { schoolTable, teamTable } from '.'

export const teacherTable = pgTable('teachers', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  schoolId: uuid().notNull().references(() => schoolTable.id, { onUpdate: 'cascade', onDelete: 'restrict' })
})

export const teacherTableRelations = relations(teacherTable, ({ many }) => ({
  teams: many(teamTable)
}))

export type DbTeacher = typeof teacherTable.$inferSelect