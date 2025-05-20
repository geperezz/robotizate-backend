import { pgTable, uuid } from 'drizzle-orm/pg-core'

import { robotTable } from './robot.table'

export const danceParticipantTable = pgTable('dance_participants', {
  robotId: uuid().primaryKey().references(() => robotTable.id, { onUpdate: 'cascade', onDelete: 'restrict' }),
})

export type DbDanceParticipant = typeof danceParticipantTable.$inferSelect