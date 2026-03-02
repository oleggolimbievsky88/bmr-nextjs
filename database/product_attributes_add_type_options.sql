-- Add 'multiselect' to category_attributes.type and add options column.
-- Run after product_attributes_schema.sql. Safe to re-run (options added only if missing).

-- Add multiselect to ENUM
ALTER TABLE category_attributes
  MODIFY COLUMN type ENUM('text','boolean','select','multiselect') NOT NULL DEFAULT 'text';

-- Add options column (for select/multiselect: one option per line, or comma-separated; special value __product_colors__ = use product colors list)
SET @opt_col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'category_attributes' AND COLUMN_NAME = 'options'
);
SET @sql = IF(@opt_col_exists = 0,
  'ALTER TABLE category_attributes ADD COLUMN options TEXT NULL DEFAULT NULL AFTER type',
  'DO 0');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
