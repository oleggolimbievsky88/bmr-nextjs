-- Add nav_urls (URLs for main menu links) to brands table.
-- Run once per DB: mysql -u user -p database < database/add_nav_urls.sql
-- For brand_core: mysql -u user -p brand_core < database/add_nav_urls.sql

ALTER TABLE `brands` ADD COLUMN `nav_urls` json DEFAULT NULL;
