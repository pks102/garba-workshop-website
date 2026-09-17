CREATE TABLE `registrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`participant_name` text NOT NULL,
	`participant_type` text NOT NULL,
	`age` integer,
	`guardian_name` text,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`participants` integer NOT NULL,
	`amount` integer NOT NULL,
	`transaction_id` text NOT NULL,
	`payment_status` text DEFAULT 'submitted' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_registrations_transaction_id` ON `registrations` (`transaction_id`);