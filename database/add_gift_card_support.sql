-- Add gift card support to coupons_new and link gift cards to orders
-- Run this after coupons_new and new_orders tables exist

-- Add gift card columns to coupons_new (safe to run multiple times)
DELIMITER //

DROP PROCEDURE IF EXISTS add_gift_card_coupon_columns//

CREATE PROCEDURE add_gift_card_coupon_columns()
BEGIN
  DECLARE col_count INT DEFAULT 0;

  SELECT COUNT(*) INTO col_count FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'coupons_new' AND COLUMN_NAME = 'is_gift_card';
  IF col_count = 0 THEN
    ALTER TABLE coupons_new ADD COLUMN is_gift_card TINYINT(1) NOT NULL DEFAULT 0;
  END IF;

  SELECT COUNT(*) INTO col_count FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'coupons_new' AND COLUMN_NAME = 'remaining_balance';
  IF col_count = 0 THEN
    ALTER TABLE coupons_new ADD COLUMN remaining_balance DECIMAL(10,2) DEFAULT NULL;
  END IF;

  SELECT COUNT(*) INTO col_count FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'coupons_new' AND COLUMN_NAME = 'order_id';
  IF col_count = 0 THEN
    ALTER TABLE coupons_new ADD COLUMN order_id INT UNSIGNED DEFAULT NULL;
  END IF;

END//

DELIMITER ;

CALL add_gift_card_coupon_columns();
DROP PROCEDURE IF EXISTS add_gift_card_coupon_columns;

-- Add gift_card to discount_type enum (may need manual run if your enum differs)
ALTER TABLE coupons_new MODIFY discount_type ENUM('percentage','fixed_amount','free_shipping','gift_card') NOT NULL;

-- Table to link gift cards to orders for display on receipts/admin
CREATE TABLE IF NOT EXISTS order_gift_cards (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  new_order_id INT UNSIGNED NOT NULL,
  new_order_item_id INT UNSIGNED DEFAULT NULL,
  coupon_id INT UNSIGNED NOT NULL,
  initial_amount DECIMAL(10,2) NOT NULL,
  product_name VARCHAR(255) DEFAULT NULL,
  part_number VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_order (new_order_id),
  INDEX idx_coupon (coupon_id),
  FOREIGN KEY (new_order_id) REFERENCES new_orders(new_order_id) ON DELETE CASCADE,
  FOREIGN KEY (coupon_id) REFERENCES coupons_new(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
