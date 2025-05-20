CREATE TABLE "dance_participants" (
	"robotId" uuid PRIMARY KEY NOT NULL,
	"rank" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dance_performances" (
	"robotId" uuid NOT NULL,
	"genre" text NOT NULL,
	"criterionName" text NOT NULL,
	"criterionScore" integer NOT NULL,
	CONSTRAINT "dance_performances_robotId_genre_criterionName_pk" PRIMARY KEY("robotId","genre","criterionName")
);
--> statement-breakpoint
CREATE TABLE "scoring_criteria" (
	"name" text PRIMARY KEY NOT NULL,
	"minScore" integer NOT NULL,
	"maxScore" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dance_participants" ADD CONSTRAINT "dance_participants_robotId_robots_id_fk" FOREIGN KEY ("robotId") REFERENCES "public"."robots"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "dance_performances" ADD CONSTRAINT "dance_performances_robotId_dance_participants_robotId_fk" FOREIGN KEY ("robotId") REFERENCES "public"."dance_participants"("robotId") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "dance_performances" ADD CONSTRAINT "dance_performances_criterionName_scoring_criteria_name_fk" FOREIGN KEY ("criterionName") REFERENCES "public"."scoring_criteria"("name") ON DELETE restrict ON UPDATE cascade;