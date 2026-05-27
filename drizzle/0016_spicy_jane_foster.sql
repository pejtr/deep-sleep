ALTER TABLE `email_leads` ADD `lifecycleStage` enum('lead','prospect','customer','churned') DEFAULT 'lead';--> statement-breakpoint
ALTER TABLE `email_leads` ADD `leadScore` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `email_leads` ADD `tags` text;--> statement-breakpoint
ALTER TABLE `email_leads` ADD `utmSource` varchar(64);--> statement-breakpoint
ALTER TABLE `email_leads` ADD `utmMedium` varchar(64);--> statement-breakpoint
ALTER TABLE `email_leads` ADD `utmCampaign` varchar(128);--> statement-breakpoint
ALTER TABLE `email_leads` ADD `country` varchar(4);--> statement-breakpoint
ALTER TABLE `email_leads` ADD `language` varchar(8);--> statement-breakpoint
ALTER TABLE `email_leads` ADD `firstName` varchar(128);--> statement-breakpoint
ALTER TABLE `email_leads` ADD `lastActivityAt` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `email_leads` ADD `convertedToCustomer` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `email_leads` ADD `totalRevenue` decimal(10,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `email_leads` ADD `emailsOpened` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `email_leads` ADD `emailsClicked` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `email_leads` ADD `brevoContactId` varchar(64);--> statement-breakpoint
ALTER TABLE `email_leads` ADD `redditAudienceUploaded` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `email_leads` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `email_leads` ADD `updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;