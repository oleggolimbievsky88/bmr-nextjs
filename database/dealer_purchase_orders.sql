-- Dealer Purchase Orders: dealers build a PO from their dashboard and send it;
-- admin sees received POs on the admin dashboard.

CREATE TABLE IF NOT EXISTS `dealer_purchase_orders` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` int unsigned NOT NULL COMMENT 'Dealer (customers.CustomerID)',
  `status` enum('draft','sent','viewed','processing','completed') NOT NULL DEFAULT 'draft',
  `po_number` varchar(50) DEFAULT NULL COMMENT 'Optional human-readable PO number',
  `notes` text DEFAULT NULL COMMENT 'Dealer notes',
  `admin_notes` text DEFAULT NULL COMMENT 'Internal notes',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sent_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  KEY `status` (`status`),
  KEY `sent_at` (`sent_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dealer_po_items` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `po_id` int unsigned NOT NULL,
  `product_id` int unsigned NOT NULL,
  `part_number` varchar(100) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` int unsigned NOT NULL DEFAULT 1,
  `color_id` int unsigned DEFAULT NULL COMMENT 'colors.ColorID',
  `color_name` varchar(100) DEFAULT NULL COMMENT 'Denormalized for display',
  `unit_price` decimal(10,2) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `po_id` (`po_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `dealer_po_items_ibfk_1` FOREIGN KEY (`po_id`) REFERENCES `dealer_purchase_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
