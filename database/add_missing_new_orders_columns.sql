-- Add missing columns to new_orders (and new_order_items) when tables already exist.
-- Safe to run multiple times: only adds columns that are not present.
-- Covers: add_cc_columns_new_orders.sql + add_tracking_number.sql.

-- new_orders: CC columns (charge-when-ship flow)
-- cc_payment_token, cc_last_four, cc_type, cc_exp_month, cc_exp_year
-- new_orders: tracking_number

DELIMITER //

DROP PROCEDURE IF EXISTS add_missing_new_orders_columns//

CREATE PROCEDURE add_missing_new_orders_columns()
BEGIN
  DECLARE col_count INT DEFAULT 0;

  -- cc_payment_token
  SELECT COUNT(*) INTO col_count FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'new_orders' AND COLUMN_NAME = 'cc_payment_token';
  IF col_count = 0 THEN
    ALTER TABLE `new_orders` ADD COLUMN `cc_payment_token` VARCHAR(255) DEFAULT NULL
      COMMENT 'Processor token or Authorize.net payment profile ID' AFTER `notes`;
  END IF;

  -- cc_last_four
  SELECT COUNT(*) INTO col_count FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'new_orders' AND COLUMN_NAME = 'cc_last_four';
  IF col_count = 0 THEN
    ALTER TABLE `new_orders` ADD COLUMN `cc_last_four` VARCHAR(4) DEFAULT NULL AFTER `cc_payment_token`;
  END IF;

  -- cc_type
  SELECT COUNT(*) INTO col_count FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'new_orders' AND COLUMN_NAME = 'cc_type';
  IF col_count = 0 THEN
    ALTER TABLE `new_orders` ADD COLUMN `cc_type` VARCHAR(20) DEFAULT NULL AFTER `cc_last_four`;
  END IF;

  -- cc_exp_month
  SELECT COUNT(*) INTO col_count FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'new_orders' AND COLUMN_NAME = 'cc_exp_month';
  IF col_count = 0 THEN
    ALTER TABLE `new_orders` ADD COLUMN `cc_exp_month` VARCHAR(2) DEFAULT NULL AFTER `cc_type`;
  END IF;

  -- cc_exp_year
  SELECT COUNT(*) INTO col_count FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'new_orders' AND COLUMN_NAME = 'cc_exp_year';
  IF col_count = 0 THEN
    ALTER TABLE `new_orders` ADD COLUMN `cc_exp_year` VARCHAR(4) DEFAULT NULL AFTER `cc_exp_month`;
  END IF;

  -- tracking_number
  SELECT COUNT(*) INTO col_count FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'new_orders' AND COLUMN_NAME = 'tracking_number';
  IF col_count = 0 THEN
    ALTER TABLE `new_orders` ADD COLUMN `tracking_number` VARCHAR(100) DEFAULT NULL AFTER `status`;
  END IF;

END//

DELIMITER ;

CALL add_missing_new_orders_columns();
DROP PROCEDURE IF EXISTS add_missing_new_orders_columns;
