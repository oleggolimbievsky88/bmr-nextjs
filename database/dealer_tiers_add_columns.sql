-- Add discount, flat rate shipping, and timestamp columns to existing dealer_tiers.
-- Run this if dealer_tiers already exists but is missing these columns.
--
-- Option A: Run the block below as one statement (fails if any column already exists).
-- Option B: Run each ALTER separately; if you get "Duplicate column", that column
--   already exists—comment out that ALTER and run the rest.

-- Option A (all at once; use only if none of these columns exist yet):
/*
ALTER TABLE dealer_tiers
  ADD COLUMN discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0 COMMENT 'Discount % applied to dealer orders' AFTER name,
  ADD COLUMN flat_rate_shipping DECIMAL(10,2) NOT NULL DEFAULT 14.95 COMMENT 'Flat rate shipping (lower 48 US)' AFTER discount_percent,
  ADD COLUMN sort_order INT UNSIGNED NOT NULL DEFAULT 0 AFTER flat_rate_shipping,
  ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER sort_order,
  ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;
*/

-- Option B (one column at a time; skip any ALTER that fails with "Duplicate column"):
ALTER TABLE dealer_tiers
  ADD COLUMN discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0
    COMMENT 'Discount % applied to dealer orders'
    AFTER name;

ALTER TABLE dealer_tiers
  ADD COLUMN flat_rate_shipping DECIMAL(10,2) NOT NULL DEFAULT 14.95
    COMMENT 'Flat rate shipping (lower 48 US)'
    AFTER discount_percent;

ALTER TABLE dealer_tiers
  ADD COLUMN sort_order INT UNSIGNED NOT NULL DEFAULT 0
    AFTER flat_rate_shipping;

ALTER TABLE dealer_tiers
  ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    AFTER sort_order;

ALTER TABLE dealer_tiers
  ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    AFTER created_at;
