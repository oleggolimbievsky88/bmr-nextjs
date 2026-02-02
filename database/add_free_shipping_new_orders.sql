-- Add free_shipping column and backfill: set free_shipping = 1 and shipping_method = 'Free Shipping'
-- for orders that had free shipping (shipping_cost = 0).
--
-- Run (1) once; if free_shipping column already exists, you'll get an error — skip to (2).
-- Run (2) anytime to fix existing rows.

-- (1) Add column (omit if already present)
ALTER TABLE `new_orders`
  ADD COLUMN `free_shipping` TINYINT(1) NOT NULL DEFAULT 0
  COMMENT '1 = free shipping (coupon or free option)' AFTER `shipping_cost`;

-- (2) Backfill: mark free shipping and set method to 'Free Shipping' where cost was zero
UPDATE `new_orders`
SET
  `free_shipping` = 1,
  `shipping_method` = 'Free Shipping'
WHERE COALESCE(`shipping_cost`, 0) = 0;
