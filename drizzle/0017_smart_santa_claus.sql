ALTER TABLE `email_leads` ADD `utmContent` varchar(128);--> statement-breakpoint
ALTER TABLE `email_leads` ADD `utmTerm` varchar(128);--> statement-breakpoint
ALTER TABLE `email_leads` ADD `referrer` varchar(512);--> statement-breakpoint
ALTER TABLE `email_leads` ADD `referrerDomain` varchar(128);--> statement-breakpoint
ALTER TABLE `email_leads` ADD `landingPage` varchar(512);--> statement-breakpoint
ALTER TABLE `email_leads` ADD `deviceType` varchar(16);--> statement-breakpoint
ALTER TABLE `email_leads` ADD `browser` varchar(32);--> statement-breakpoint
ALTER TABLE `email_leads` ADD `sleepScore` int;--> statement-breakpoint
ALTER TABLE `email_leads` ADD `sleepIssues` text;--> statement-breakpoint
ALTER TABLE `email_leads` ADD `quizAnswers` text;--> statement-breakpoint
ALTER TABLE `email_leads` ADD `persona` varchar(32);--> statement-breakpoint
ALTER TABLE `email_leads` ADD `emailSequenceStep` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `email_leads` ADD `lastEmailSentAt` timestamp;--> statement-breakpoint
ALTER TABLE `email_leads` ADD `pageViewCount` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `email_leads` ADD `timeOnSiteSec` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `email_leads` ADD `purchaseAttempts` int DEFAULT 0;