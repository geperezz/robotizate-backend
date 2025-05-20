import { pgTable, text, uuid } from 'drizzle-orm/pg-core'

export const schoolTable = pgTable('schools', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  logo: text().notNull(),
})

export type DbSchool = typeof schoolTable.$inferSelect