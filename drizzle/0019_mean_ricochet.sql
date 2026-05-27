CREATE TABLE `campaigns` (
	`id` varchar(64) NOT NULL,
	`campaignType` enum('FLASH_SALE','REACTIVATION','VIP_BUNDLE','UPSELL_BLAST') NOT NULL,
	`name` varchar(128) NOT NULL,
	`campaignStatus` enum('DRAFT','SENDING','SENT','FAILED') NOT NULL DEFAULT 'DRAFT',
	`targetCount` int NOT NULL DEFAULT 0,
	`sentCount` int NOT NULL DEFAULT 0,
	`openCount` int DEFAULT 0,
	`clickCount` int DEFAULT 0,
	`convertedCount` int DEFAULT 0,
	`revenue` int DEFAULT 0,
	`subject` varchar(256),
	`preheader` varchar(256),
	`htmlBody` text,
	`source` varchar(32) DEFAULT 'admin',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`sentAt` timestamp,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
