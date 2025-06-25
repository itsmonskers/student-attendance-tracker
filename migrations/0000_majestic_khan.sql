CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"type" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"date" date NOT NULL,
	"status" text NOT NULL,
	"time" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	CONSTRAINT "classes_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"original_name" text NOT NULL,
	"mimetype" text NOT NULL,
	"size" integer NOT NULL,
	"uploaded_by" integer NOT NULL,
	"upload_date" timestamp DEFAULT now(),
	"file_path" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"class_name" text NOT NULL,
	"phone_number" text,
	"parent_name" text,
	"parent_phone" text,
	"address" text,
	"active" boolean DEFAULT true,
	CONSTRAINT "students_student_id_unique" UNIQUE("student_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"full_name" text NOT NULL,
	"role" text DEFAULT 'student' NOT NULL,
	"profile_image" text,
	"email" text,
	"student_id" text,
	"class_name" text,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
