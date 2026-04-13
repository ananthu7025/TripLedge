CREATE TABLE "contact_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(100) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"property_type" varchar(50) NOT NULL,
	"service_needed" varchar(100) NOT NULL,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dropdown_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" varchar(50) NOT NULL,
	"label" varchar(100) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "snow_removals" DROP CONSTRAINT "snow_removals_zone_id_zones_id_fk";
--> statement-breakpoint
ALTER TABLE "company_settings" ADD COLUMN "difficulty_weight" numeric(5, 3) DEFAULT '0.200';--> statement-breakpoint
ALTER TABLE "snow_removals" ADD COLUMN "house_no" varchar(50);--> statement-breakpoint
ALTER TABLE "snow_removals" ADD COLUMN "issues_reported" text;--> statement-breakpoint
ALTER TABLE "snow_removals" ADD COLUMN "additional_comments" text;--> statement-breakpoint
ALTER TABLE "snow_removals" ADD COLUMN "materials_used" text;--> statement-breakpoint
ALTER TABLE "snow_removals" ADD COLUMN "crew_members" text;--> statement-breakpoint
ALTER TABLE "trip_inspections" ADD COLUMN "house_no" varchar(50);--> statement-breakpoint
ALTER TABLE "trip_inspections" ADD COLUMN "inspected_users" text;--> statement-breakpoint
ALTER TABLE "trip_inspections" ADD COLUMN "completed_users" text;--> statement-breakpoint
ALTER TABLE "dropdown_options" ADD CONSTRAINT "dropdown_options_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snow_removals" DROP COLUMN "zone_id";--> statement-breakpoint
ALTER TABLE "snow_removals" DROP COLUMN "zone_type";--> statement-breakpoint
ALTER TABLE "snow_removals" DROP COLUMN "problem_description";--> statement-breakpoint
ALTER TABLE "snow_removals" DROP COLUMN "notes";--> statement-breakpoint
ALTER TABLE "trip_inspections" DROP COLUMN "avenue_name";--> statement-breakpoint
ALTER TABLE "trip_inspections" DROP COLUMN "zone_type";--> statement-breakpoint
ALTER TABLE "zones" DROP COLUMN "module";--> statement-breakpoint
ALTER TABLE "zones" DROP COLUMN "priority";