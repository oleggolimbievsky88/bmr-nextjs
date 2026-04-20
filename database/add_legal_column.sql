-- Add legal JSON to brands (brand_core and any app DB using this schema)
-- Run on the SAME DB where you got the error:
--   mysql -u user -p your_db < database/add_legal_column.sql

ALTER TABLE `brands`
  ADD COLUMN `legal` json DEFAULT NULL;
