ALTER TABLE "scoring_criteria" RENAME TO "dance_scoring_criteria";--> statement-breakpoint
ALTER TABLE "dance_performances" DROP CONSTRAINT "dance_performances_criterionName_scoring_criteria_name_fk";
--> statement-breakpoint
ALTER TABLE "dance_performances" ADD CONSTRAINT "dance_performances_criterionName_dance_scoring_criteria_name_fk" FOREIGN KEY ("criterionName") REFERENCES "public"."dance_scoring_criteria"("name") ON DELETE restrict ON UPDATE cascade;