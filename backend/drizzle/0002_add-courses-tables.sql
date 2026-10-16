CREATE TYPE "public"."course_level" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."course_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"cover_url" varchar(500),
	"category_id" integer NOT NULL,
	"instructor_id" uuid,
	"level" "course_level" DEFAULT 'beginner' NOT NULL,
	"price_cents" integer DEFAULT 0 NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"status" "course_status" DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"lessons_count" integer DEFAULT 0 NOT NULL,
	"duration_minutes" integer DEFAULT 0 NOT NULL,
	"students_count" integer DEFAULT 0 NOT NULL,
	"rating_avg" numeric(3, 1),
	"reviews_count" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "courses_status_category_id_index" ON "courses" USING btree ("status","category_id");--> statement-breakpoint
CREATE INDEX "courses_instructor_id_index" ON "courses" USING btree ("instructor_id");