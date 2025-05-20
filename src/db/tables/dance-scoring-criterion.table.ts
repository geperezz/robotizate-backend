import { integer, pgTable, text } from 'drizzle-orm/pg-core'

export const danceScoringCriterionTable = pgTable('dance_scoring_criteria', {
  name: text().primaryKey(),
  minScore: integer().notNull(),
  maxScore: integer().notNull(),
})

export type DbDanceScoringCriterion = typeof danceScoringCriterionTable.$inferSelect