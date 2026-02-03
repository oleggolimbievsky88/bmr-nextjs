-- Add missing columns to dealer_tiers if upgrading from older schema.
-- Run each statement; if a column already exists, that statement will error (safe to ignore).

ALTER TABLE dealer_tiers ADD COLUMN name VARCHAR(100) NULL AFTER tier;
ALTER TABLE dealer_tiers ADD COLUMN flat_rate_shipping DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER discount_percent;
ALTER TABLE dealer_tiers ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
