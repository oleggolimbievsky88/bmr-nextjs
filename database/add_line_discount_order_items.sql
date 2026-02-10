-- Add line_discount to new_order_items for per-line coupon discount display.
-- Safe to run multiple times: only adds the column if missing.

DELIMITER //

DROP PROCEDURE IF EXISTS add_line_discount_new_order_items//

CREATE PROCEDURE add_line_discount_new_order_items()
BEGIN
  DECLARE col_count INT DEFAULT 0;

  SELECT COUNT(*) INTO col_count FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'new_order_items' AND COLUMN_NAME = 'line_discount';
  IF col_count = 0 THEN
    ALTER TABLE `new_order_items`
      ADD COLUMN `line_discount` DECIMAL(10,2) NOT NULL DEFAULT 0.00
      COMMENT 'Coupon discount applied to this line only'
      AFTER `image`;
  END IF;

END//

DELIMITER ;

CALL add_line_discount_new_order_items();
DROP PROCEDURE IF EXISTS add_line_discount_new_order_items;
