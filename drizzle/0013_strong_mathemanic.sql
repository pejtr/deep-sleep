CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`keyHash` varchar(128) NOT NULL,
	`name` varchar(128) NOT NULL,
	`permissions` text NOT NULL DEFAULT ('read'),
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastUsedAt` timestamp,
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `api_keys_keyHash_unique` UNIQUE(`keyHash`)
);
--> statement-breakpoint
CREATE TABLE `outbound_webhooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`url` text NOT NULL,
	`secret` varchar(128),
	`events` text NOT NULL DEFAULT ('[]'),
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastTriggeredAt` timestamp,
	`lastStatus` int,
	CONSTRAINT `outbound_webhooks_id` PRIMARY KEY(`id`)
);
