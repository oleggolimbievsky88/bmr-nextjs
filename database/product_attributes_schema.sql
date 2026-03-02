-- Product attributes: attribute categories (e.g. Control Arms, Sway Bars) and
-- attribute definitions per category. Products get optional AttributeCategoryID
-- to use an attribute set. Run on both dev and production databases.
--
-- No FK constraints to avoid timeouts; application enforces references.

-- ---------------------------------------------------------------------------
-- 1. attribute_categories (logical attribute sets, not platform-specific)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attribute_categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_attribute_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 2. category_attributes (attribute definitions per attribute category)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS category_attributes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  attribute_category_id INT UNSIGNED NOT NULL,
  slug VARCHAR(100) NOT NULL,
  label VARCHAR(255) NOT NULL,
  type ENUM('text','boolean','select','multiselect') NOT NULL DEFAULT 'text',
  options TEXT NULL DEFAULT NULL COMMENT 'For select/multiselect: one per line or comma-separated; __product_colors__ = use product colors',
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_category_attributes_category_slug (attribute_category_id, slug),
  KEY idx_category_attributes_attribute_category_id (attribute_category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 3. product_attribute_values (values per product per attribute)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_attribute_values (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  ProductID INT UNSIGNED NOT NULL,
  category_attribute_id INT UNSIGNED NOT NULL,
  value VARCHAR(500) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_product_attribute_values_product_attr (ProductID, category_attribute_id),
  KEY idx_product_attribute_values_ProductID (ProductID),
  KEY idx_product_attribute_values_category_attribute_id (category_attribute_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 4. products: add AttributeCategoryID (optional link to attribute set)
-- ---------------------------------------------------------------------------
-- Idempotent: safe to re-run (skips if column/index already exist).

SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'AttributeCategoryID'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE products ADD COLUMN AttributeCategoryID INT UNSIGNED NULL DEFAULT NULL',
  'DO 0');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND INDEX_NAME = 'idx_products_AttributeCategoryID'
);
SET @sql = IF(@idx_exists = 0,
  'ALTER TABLE products ADD KEY idx_products_AttributeCategoryID (AttributeCategoryID)',
  'DO 0');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;