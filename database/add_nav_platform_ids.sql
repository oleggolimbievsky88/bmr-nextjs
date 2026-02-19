-- Add nav_platform_ids (which nav items show mega menu vs plain link) to brands table.
-- Run once per DB: mysql -u user -p database < database/add_nav_platform_ids.sql

ALTER TABLE `brands` ADD COLUMN `nav_platform_ids` json DEFAULT NULL;
