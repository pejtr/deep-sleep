ALTER TABLE `orders` ADD `utmSource` varchar(64);--> statement-breakpoint
ALTER TABLE `orders` ADD `utmMedium` varchar(64);--> statement-breakpoint
ALTER TABLE `orders` ADD `utmCampaign` varchar(128);--> statement-breakpoint
ALTER TABLE `orders` ADD `utmContent` varchar(128);--> statement-breakpoint
ALTER TABLE `orders` ADD `utmTerm` varchar(128);--> statement-breakpoint
ALTER TABLE `orders` ADD `referrer` varchar(256);