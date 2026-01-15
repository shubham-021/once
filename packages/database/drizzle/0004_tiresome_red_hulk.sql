CREATE TYPE "public"."credit_transaction_type" AS ENUM('purchase', 'usage', 'refund', 'bonus');--> statement-breakpoint
CREATE TABLE "credit_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "credit_transaction_type" NOT NULL,
	"amount" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"payment_id" text,
	"package_name" varchar(50),
	"amount_paid" integer,
	"story_id" integer,
	"scene_id" integer,
	"claude_input_tokens" integer,
	"claude_output_tokens" integer,
	"gpt_input_tokens" integer,
	"gpt_output_tokens" integer,
	"embedding_tokens" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_credits" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"lifetime_purchased" integer DEFAULT 0 NOT NULL,
	"lifetime_used" integer DEFAULT 0 NOT NULL,
	"last_purchase_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_credits_user_id_unique" UNIQUE("user_id")
);
