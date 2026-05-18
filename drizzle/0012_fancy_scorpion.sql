ALTER TABLE `email_sequences` ADD `email` varchar(320);--> statement-breakpoint
ALTER TABLE `email_sequences` ADD `chronotype` varchar(32) DEFAULT 'Bear';--> statement-breakpoint
ALTER TABLE `email_sequences` ADD `scheduledAt` timestamp;