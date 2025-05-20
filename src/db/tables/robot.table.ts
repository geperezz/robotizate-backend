import { pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { teamTable } from './team.table'

export const robotTable = pgTable('robots', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  teamId: uuid().notNull().references(() => teamTable.id, { onUpdate: 'cascade', onDelete: 'restrict' }),
  picture: text().notNull(),
})

export type DbRobot = typeof robotTable.$inferSelect