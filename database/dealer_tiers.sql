-- Dealer tiers: discount percent and flat rate shipping (lower 48).
-- Customers with role dealer get a tier (1, 2, 3); Tier 1 & 2 get flat rate shipping in lower 48.
-- Run this once to create the table and seed default tiers.

CREATE TABLE IF NOT EXISTS dealer_tiers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  tier INT UNSIGNED NOT NULL COMMENT 'Tier number: 1, 2, 3',
  name VARCHAR(100) NOT NULL DEFAULT '',
  discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0 COMMENT 'Discount % applied to dealer orders',
  flat_rate_shipping DECIMAL(10,2) NOT NULL DEFAULT 14.95 COMMENT 'Flat rate shipping (lower 48 US)',
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tier (tier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default tiers (run only if table is empty)
INSERT IGNORE INTO dealer_tiers (tier, name, discount_percent, flat_rate_shipping, sort_order)
VALUES
  (1, 'Tier 1', 25.00, 14.95, 1),
  (2, 'Tier 2', 20.00, 14.95, 2),
  (3, 'Tier 3', 15.00, 0.00, 3);
