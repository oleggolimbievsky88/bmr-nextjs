-- Order status change history (who changed status, when)
CREATE TABLE IF NOT EXISTS `order_status_history` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `new_order_id` int unsigned NOT NULL,
  `changed_by_user_id` varchar(50) DEFAULT NULL,
  `changed_by_email` varchar(255) NOT NULL,
  `changed_by_name` varchar(255) DEFAULT NULL,
  `previous_status` varchar(50) DEFAULT NULL,
  `new_status` varchar(50) NOT NULL,
  `tracking_number` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `new_order_id` (`new_order_id`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CC number reveal log (who revealed, when)
CREATE TABLE IF NOT EXISTS `order_cc_reveal_log` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `new_order_id` int unsigned NOT NULL,
  `revealed_by_user_id` varchar(50) DEFAULT NULL,
  `revealed_by_email` varchar(255) NOT NULL,
  `revealed_by_name` varchar(255) DEFAULT NULL,
  `revealed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `new_order_id` (`new_order_id`),
  KEY `revealed_at` (`revealed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
