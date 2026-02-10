-- Multiple tracking numbers per order
-- Run this migration to add support for multiple tracking numbers per order.

CREATE TABLE IF NOT EXISTS `order_tracking` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `new_order_id` int unsigned NOT NULL,
  `tracking_number` varchar(255) NOT NULL,
  `carrier` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `new_order_id` (`new_order_id`),
  CONSTRAINT `order_tracking_ibfk_1` FOREIGN KEY (`new_order_id`) REFERENCES `new_orders` (`new_order_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
