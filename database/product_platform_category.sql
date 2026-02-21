-- Per-platform category: one product can be in a different category on each platform.
-- products.CatID remains as primary/fallback (first platform's category).
--
-- Run Step 1 first, then Step 2. No FKs to avoid Workbench timeouts.

-- ---------------------------------------------------------------------------
-- Step 1: Create the table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_platform_category (
  ProductID INT UNSIGNED NOT NULL,
  BodyID INT UNSIGNED NOT NULL,
  CatID INT UNSIGNED NOT NULL,
  PRIMARY KEY (ProductID, BodyID),
  KEY idx_product_platform_category_BodyID (BodyID),
  KEY idx_product_platform_category_CatID (CatID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Step 2: Backfill from product_platforms + products.CatID (first value if comma-separated)
-- ---------------------------------------------------------------------------
SET SESSION FOREIGN_KEY_CHECKS = 0;

INSERT IGNORE INTO product_platform_category (ProductID, BodyID, CatID)
SELECT pp.ProductID, pp.BodyID,
  CAST(SUBSTRING_INDEX(TRIM(COALESCE(p.CatID, '0')), ',', 1) AS UNSIGNED)
FROM product_platforms pp
JOIN products p ON p.ProductID = pp.ProductID
WHERE COALESCE(TRIM(p.CatID), '') != '' AND COALESCE(TRIM(p.CatID), '0') != '0';

SET SESSION FOREIGN_KEY_CHECKS = 1;
