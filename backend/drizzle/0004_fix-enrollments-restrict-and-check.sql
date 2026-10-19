ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_progress_percent_check" CHECK ("enrollments"."progress_percent" >= 0 AND "enrollments"."progress_percent" <= 100);