CREATE TABLE `user_journey_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(128) NOT NULL,
	`personaId` varchar(32) NOT NULL,
	`personaName` varchar(128) NOT NULL,
	`step` varchar(64) NOT NULL,
	`stepNumber` int NOT NULL,
	`duration` int,
	`metadata` text,
	`chronotype` varchar(16),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_journey_events_id` PRIMARY KEY(`id`)
);
