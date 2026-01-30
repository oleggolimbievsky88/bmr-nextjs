-- Dealer tier configuration: tiers 1-8 with discount percentage.
-- Run this after auth_schema.sql. Customers.dealerTier (1-8) references these tiers.

CREATE TABLE IF NOT EXISTS `dealer_tiers` (
  `tier` TINYINT UNSIGNED NOT NULL COMMENT '1-8',
  `discount_percent` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`tier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default tiers (0% discount); admin can update via Dealer Tiers page.
INSERT INTO `dealer_tiers` (`tier`, `discount_percent`) VALUES
(1, 5),
(2, 7)
(3, 10),
(4, 12),
(5, 15),
(6, 17),
(7, 20),
(8, 25)
ON DUPLICATE KEY UPDATE `tier` = `tier`;
