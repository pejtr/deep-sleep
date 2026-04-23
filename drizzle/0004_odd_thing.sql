ALTER TABLE `orders` ADD `stripeSessionId` varchar(128);--> statement-breakpoint
ALTER TABLE `orders` ADD `stripePaymentIntentId` varchar(128);--> statement-breakpoint
ALTER TABLE `orders` ADD `currency` varchar(8) DEFAULT 'usd';