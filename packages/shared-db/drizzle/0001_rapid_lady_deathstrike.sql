CREATE TABLE IF NOT EXISTS "email_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"default_signature_html" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_settings_organization_id_unique" UNIQUE("organization_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "email_settings" ADD CONSTRAINT "email_settings_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
