CREATE TYPE "public"."course_activity_action" AS ENUM('course.created', 'course.updated', 'course.published', 'course.unpublished', 'module.created', 'module.updated', 'module.deleted', 'modules.reordered', 'lesson.created', 'lesson.updated', 'lesson.deleted', 'lessons.reordered');--> statement-breakpoint
CREATE TABLE "course_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"actor_id" uuid,
	"action" "course_activity_action" NOT NULL,
	"entity_id" uuid,
	"changes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "duration_seconds" integer;--> statement-breakpoint
ALTER TABLE "course_activity" ADD CONSTRAINT "course_activity_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_activity" ADD CONSTRAINT "course_activity_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "course_activity_course_id_created_at_index" ON "course_activity" USING btree ("course_id","created_at");--> statement-breakpoint
CREATE INDEX "course_activity_created_at_index" ON "course_activity" USING btree ("created_at");