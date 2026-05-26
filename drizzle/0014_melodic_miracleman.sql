CREATE TABLE `affiliate_clicks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`refCode` varchar(64) NOT NULL,
	`ipHash` varchar(64),
	`landingUrl` varchar(512),
	`userAgent` varchar(512),
	`utmCampaign` varchar(256),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `affiliate_clicks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `affiliate_conversions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`refCode` varchar(64) NOT NULL,
	`orderId` int NOT NULL,
	`orderAmountCents` int NOT NULL,
	`commissionCents` int NOT NULL,
	`affConvStatus` enum('pending','approved','paid','reversed') NOT NULL DEFAULT 'pending',
	`customerEmail` varchar(320),
	`productKey` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`paidAt` timestamp,
	CONSTRAINT `affiliate_conversions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `affiliate_payouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`refCode` varchar(64) NOT NULL,
	`amountCents` int NOT NULL,
	`payoutMethod` varchar(32) DEFAULT 'paypal',
	`payoutAddress` varchar(320),
	`payoutStatus` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `affiliate_payouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletter_subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`firstName` varchar(128),
	`source` varchar(64) NOT NULL DEFAULT 'squeeze',
	`confirmed` boolean NOT NULL DEFAULT false,
	`confirmToken` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `newsletter_subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletter_subscribers_email_unique` UNIQUE(`email`)
);
