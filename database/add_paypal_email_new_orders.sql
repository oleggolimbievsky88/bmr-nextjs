-- Store PayPal payer email for orders paid with PayPal.
-- Run once; if column already exists, the statement will error (safe to ignore).
ALTER TABLE `new_orders`
ADD COLUMN `paypal_email` VARCHAR(255) DEFAULT NULL AFTER `cc_exp_year`;
