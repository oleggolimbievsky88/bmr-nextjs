-- Add size column to new_order_items for apparel/merchandise (e.g. S, M, L, XL, 2XL)
-- Safe to run multiple times: only adds the column if missing.

DELIMITER //

DROP PROCEDURE IF EXISTS add_size_new_order_items//

CREATE PROCEDURE add_size_new_order_items()
BEGIN
  DECLARE col_count INT DEFAULT 0;

  SELECT COUNT(*) INTO col_count FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'new_order_items' AND COLUMN_NAME = 'size';
  IF col_count = 0 THEN
    ALTER TABLE `new_order_items`
      ADD COLUMN `size` varchar(20) DEFAULT ''
      COMMENT 'Apparel size (e.g. S, M, L, XL, 2XL)'
      AFTER `color`;
  END IF;

END//

DELIMITER ;

CALL add_size_new_order_items();
DROP PROCEDURE IF EXISTS add_size_new_order_items;
