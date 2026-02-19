-- Drop site_name from brands (use name only). Run on each DB that has brands table:
--   mysql -u user -p database < database/drop_site_name_from_brands.sql
--   mysql -u user -p brand_core < database/drop_site_name_from_brands.sql

ALTER TABLE `brands` DROP COLUMN IF EXISTS `site_name`;
