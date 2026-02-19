-- Add nav_order (order of main menu links, enables add/delete) to brands table.
-- Run once per DB: mysql -u user -p database < database/add_nav_order.sql
-- For brand_core: mysql -u user -p brand_core < database/add_nav_order.sql

ALTER TABLE `brands` ADD COLUMN `nav_order` json DEFAULT NULL;
