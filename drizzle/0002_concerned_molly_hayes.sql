CREATE TABLE `feedbacks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(128) NOT NULL,
	`rating` int NOT NULL,
	`liked` text,
	`improved` text,
	`email` varchar(320),
	`rewardCode` varchar(32),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feedbacks_id` PRIMARY KEY(`id`)
);
