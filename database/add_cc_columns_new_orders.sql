-- Add credit card storage columns to new_orders table
-- For "charge when we ship" flow. Store only token/profile ID and last4 - never full PAN or CVV.
-- Compatible with Authorize.net Customer/Payment Profiles later (use cc_payment_token for profile ID).

ALTER TABLE `new_orders`
ADD COLUMN `cc_payment_token` VARCHAR(255) DEFAULT NULL COMMENT 'Processor token or Authorize.net payment profile ID' AFTER `notes`,
ADD COLUMN `cc_last_four` VARCHAR(4) DEFAULT NULL AFTER `cc_payment_token`,
ADD COLUMN `cc_type` VARCHAR(20) DEFAULT NULL AFTER `cc_last_four`,
ADD COLUMN `cc_exp_month` VARCHAR(2) DEFAULT NULL AFTER `cc_type`,
ADD COLUMN `cc_exp_year` VARCHAR(4) DEFAULT NULL AFTER `cc_exp_month`;
