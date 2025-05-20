ALTER TABLE "dance_performances" RENAME TO "dance_presentations";--> statement-breakpoint
ALTER TABLE "dance_presentations" DROP CONSTRAINT "dance_performances_robotId_dance_participants_robotId_fk";
--> statement-breakpoint
ALTER TABLE "dance_presentations" DROP CONSTRAINT "dance_performances_criterionName_dance_scoring_criteria_name_fk";
--> statement-breakpoint
ALTER TABLE "dance_presentations" DROP CONSTRAINT "dance_performances_robotId_genre_criterionName_pk";--> statement-breakpoint
ALTER TABLE "dance_presentations" ADD CONSTRAINT "dance_presentations_robotId_genre_criterionName_pk" PRIMARY KEY("robotId","genre","criterionName");--> statement-breakpoint
ALTER TABLE "dance_presentations" ADD CONSTRAINT "dance_presentations_robotId_dance_participants_robotId_fk" FOREIGN KEY ("robotId") REFERENCES "public"."dance_participants"("robotId") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "dance_presentations" ADD CONSTRAINT "dance_presentations_criterionName_dance_scoring_criteria_name_fk" FOREIGN KEY ("criterionName") REFERENCES "public"."dance_scoring_criteria"("name") ON DELETE restrict ON UPDATE cascade;