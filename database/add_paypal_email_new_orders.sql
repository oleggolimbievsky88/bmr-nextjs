-- Add paypal_email to new_orders (fixes "Unknown column 'paypal_email' in 'field list'").
-- Run once on your DB. If the column already exists, you'll get "Duplicate column name"; that's OK.

ALTER TABLE `new_orders`
ADD COLUMN `paypal_email` VARCHAR(255) DEFAULT NULL AFTER `cc_exp_year`;
