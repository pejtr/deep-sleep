CREATE TABLE `upsell_ab_tests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(128) NOT NULL,
	`page` varchar(32) NOT NULL,
	`variant` varchar(4) NOT NULL,
	`shown` boolean NOT NULL DEFAULT true,
	`converted` boolean NOT NULL DEFAULT false,
	`revenue` decimal(10,2) DEFAULT '0',
	`chronotype` varchar(16),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `upsell_ab_tests_id` PRIMARY KEY(`id`)
);
