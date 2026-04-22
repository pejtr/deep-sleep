CREATE TABLE `ab_impressions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(128) NOT NULL,
	`testName` varchar(64) NOT NULL,
	`variant` varchar(8) NOT NULL,
	`converted` boolean NOT NULL DEFAULT false,
	`page` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ab_impressions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `behavior_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(128) NOT NULL,
	`event` varchar(64) NOT NULL,
	`page` varchar(64),
	`element` varchar(128),
	`value` text,
	`chronotype` enum('Lion','Bear','Wolf','Dolphin'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `behavior_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`sessionId` varchar(128),
	`chronotype` enum('Lion','Bear','Wolf','Dolphin'),
	`source` varchar(64) DEFAULT 'quiz_result',
	`subscribed` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(128) NOT NULL,
	`productId` varchar(32) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`email` varchar(320),
	`chronotype` enum('Lion','Bear','Wolf','Dolphin'),
	`status` enum('pending','completed','declined') NOT NULL DEFAULT 'pending',
	`gumroadPermalink` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(128) NOT NULL,
	`chronotype` enum('Lion','Bear','Wolf','Dolphin') NOT NULL,
	`answers` text NOT NULL,
	`email` varchar(320),
	`abVariant` varchar(8),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_results_id` PRIMARY KEY(`id`)
);
