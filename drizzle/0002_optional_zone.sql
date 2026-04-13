ALTER TABLE "trip_inspections" ALTER COLUMN "zone_id" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "snow_removals" ADD COLUMN "zone_id" uuid;
--> statement-breakpoint
ALTER TABLE "snow_removals" ADD CONSTRAINT "snow_removals_zone_id_zones_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."zones"("id") ON DELETE no action ON UPDATE no action;
