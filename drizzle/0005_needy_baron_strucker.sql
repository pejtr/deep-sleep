CREATE TABLE `affiliates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(64) NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`commissionPercent` int DEFAULT 20,
	`totalCommission` decimal(10,2) DEFAULT '0',
	`affStatus` enum('active','inactive','pending') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `affiliates_id` PRIMARY KEY(`id`),
	CONSTRAINT `affiliates_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `discount_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(64) NOT NULL,
	`percentOff` int NOT NULL,
	`maxUses` int DEFAULT 1,
	`usedCount` int DEFAULT 0,
	`expiresAt` timestamp,
	`leadId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `discount_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `discount_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `email_sequences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`sequenceType` varchar(64) NOT NULL,
	`emailNumber` int NOT NULL,
	`sentAt` timestamp,
	`openedAt` timestamp,
	`clickedAt` timestamp,
	`emailStatus` enum('pending','sent','opened','clicked','bounced') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_sequences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`plan` varchar(64) NOT NULL,
	`subStatus` enum('active','past_due','cancelled','expired','trialing') NOT NULL DEFAULT 'active',
	`stripeSubscriptionId` varchar(255),
	`currentPeriodEnd` decimal(15,0),
	`cancelAtPeriodEnd` boolean DEFAULT false,
	`chronotype` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
