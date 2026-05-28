CREATE TABLE `digital_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productKey` varchar(64) NOT NULL,
	`lang` varchar(8) NOT NULL DEFAULT 'en',
	`title` varchar(256) NOT NULL,
	`subtitle` varchar(512),
	`content` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updatedBy` varchar(128),
	CONSTRAINT `digital_products_id` PRIMARY KEY(`id`),
	CONSTRAINT `digital_products_productKey_unique` UNIQUE(`productKey`)
);
