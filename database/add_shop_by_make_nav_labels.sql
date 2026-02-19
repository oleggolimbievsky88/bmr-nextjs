-- Add Shop By Make and Nav Labels to brands table.
-- Run once per DB: mysql -u user -p database < database/add_shop_by_make_nav_labels.sql
-- For brand_core: mysql -u user -p brand_core < database/add_shop_by_make_nav_labels.sql

ALTER TABLE `brands` ADD COLUMN `shop_by_make` json DEFAULT NULL;
ALTER TABLE `brands` ADD COLUMN `nav_labels` json DEFAULT NULL;
