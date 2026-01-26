CREATE TABLE IF NOT EXISTS `newsletter_subscribers` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`email` varchar(255) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
