ALTER TABLE `digital_products` DROP INDEX `digital_products_productKey_unique`;--> statement-breakpoint
ALTER TABLE `digital_products` ADD `version` varchar(16) DEFAULT 'v1.0' NOT NULL;--> statement-breakpoint
ALTER TABLE `digital_products` ADD `versionNumber` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `digital_products` ADD `isReleased` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `digital_products` ADD `isDraft` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `digital_products` ADD `releasedAt` timestamp;--> statement-breakpoint
ALTER TABLE `digital_products` ADD `changeNote` varchar(512);--> statement-breakpoint
ALTER TABLE `digital_products` ADD `createdAt` timestamp DEFAULT (now()) NOT NULL;