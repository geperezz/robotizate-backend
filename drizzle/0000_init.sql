CREATE TABLE "schools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"logo" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"schoolId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teachers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"schoolId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"schoolId" uuid NOT NULL,
	"captainId" uuid NOT NULL,
	"teacherInChargeId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams_students" (
	"teamId" uuid NOT NULL,
	"studentId" uuid NOT NULL,
	CONSTRAINT "teams_students_teamId_studentId_pk" PRIMARY KEY("teamId","studentId")
);
--> statement-breakpoint
CREATE TABLE "robots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"teamId" uuid NOT NULL,
	"picture" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_schoolId_schools_id_fk" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_schoolId_schools_id_fk" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_schoolId_schools_id_fk" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_teacherInChargeId_teachers_id_fk" FOREIGN KEY ("teacherInChargeId") REFERENCES "public"."teachers"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "teams_students" ADD CONSTRAINT "teams_students_teamId_teams_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "teams_students" ADD CONSTRAINT "teams_students_studentId_students_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "robots" ADD CONSTRAINT "robots_teamId_teams_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."teams"("id") ON DELETE restrict ON UPDATE cascade;