-- Add homepage marketing sections JSON to brands (brand_core and app DB).
-- Run once per database: mysql -u user -p brand_core < database/add_homepage_sections_column.sql

ALTER TABLE `brands`
  ADD COLUMN `homepage_sections` json DEFAULT NULL;
