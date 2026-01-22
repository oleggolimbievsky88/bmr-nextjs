-- Add tracking_number field to new_orders table
-- Run this migration to add tracking number support

ALTER TABLE `new_orders` 
ADD COLUMN `tracking_number` VARCHAR(100) DEFAULT NULL AFTER `status`;
