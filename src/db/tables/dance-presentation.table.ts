import { integer, pgTable, primaryKey, text, uuid } from 'drizzle-orm/pg-core'

import { danceScoringCriterionTable } from './dance-scoring-criterion.table'
import { danceParticipantTable } from './dance-participant.table'

export const dancePresentationTable = pgTable('dance_presentations', {
  robotId: uuid().notNull().references(() => danceParticipantTable.robotId, { onUpdate: 'cascade', onDelete: 'cascade' }),
  genre: text().notNull(),
  criterionName: text().notNull().references(() => danceScoringCriterionTable.name, { onUpdate: 'cascade', onDelete: 'restrict' }),
  criterionScore: integer().notNull(),
}, dancePresentationTable => [
  primaryKey({
    columns: [
      dancePresentationTable.robotId,
      dancePresentationTable.genre,
      dancePresentationTable.criterionName,
    ],
  })
])

export type DbDancePresentation = typeof dancePresentationTable.$inferSelect