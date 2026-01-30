-- Dealer feature suggestions: dealers can submit ideas for Dealer Portal or site improvements.

CREATE TABLE IF NOT EXISTS `dealer_suggestions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` int unsigned NOT NULL COMMENT 'Dealer (customers.CustomerID)',
  `subject` varchar(255) NOT NULL COMMENT 'Short title (e.g. Dealer Portal, Website)',
  `suggestion` text NOT NULL COMMENT 'Description of the feature or idea',
  `status` enum('new','reviewed','planned','done') NOT NULL DEFAULT 'new',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
