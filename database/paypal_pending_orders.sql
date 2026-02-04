-- Store order payload for PayPal checkout; keyed by PayPal order ID until capture.
CREATE TABLE IF NOT EXISTS `paypal_pending_orders` (
  `paypal_order_id` varchar(50) NOT NULL,
  `payload` JSON NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`paypal_order_id`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
