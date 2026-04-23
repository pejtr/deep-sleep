CREATE TABLE `ai_insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(16) NOT NULL,
	`summary` text NOT NULL,
	`recommendations` text NOT NULL,
	`metrics` text NOT NULL,
	`applied` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(128) NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`lang` varchar(8) DEFAULT 'en',
	`isAdmin` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
