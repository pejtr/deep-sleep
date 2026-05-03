CREATE TABLE `persona_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(128) NOT NULL,
	`personaId` varchar(32) NOT NULL,
	`personaName` varchar(128) NOT NULL,
	`personaDescription` text,
	`page` varchar(64) NOT NULL,
	`shown` boolean NOT NULL DEFAULT true,
	`converted` boolean NOT NULL DEFAULT false,
	`revenue` decimal(10,2) DEFAULT '0',
	`chronotype` varchar(16),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `persona_assignments_id` PRIMARY KEY(`id`)
);
