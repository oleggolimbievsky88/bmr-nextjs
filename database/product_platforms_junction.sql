-- Product-platform many-to-many: one part number can be assigned to multiple platforms.
-- products.BodyID remains as "primary" platform for backward compatibility.
--
-- In MySQL Workbench: if "query interrupted" occurs, run each section separately.
-- Optional: increase timeout (Edit -> Preferences -> SQL Execution) or run:
--   SET SESSION max_execution_time = 0;

-- ---------------------------------------------------------------------------
-- Step 1: Create the table (no foreign keys — avoids locks/timeouts in Workbench)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_platforms (
  ProductID INT UNSIGNED NOT NULL,
  BodyID INT UNSIGNED NOT NULL,
  PRIMARY KEY (ProductID, BodyID),
  KEY idx_product_platforms_BodyID (BodyID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Step 2: Backfill (run this second; disable FK checks so it runs faster)
-- ---------------------------------------------------------------------------
SET SESSION FOREIGN_KEY_CHECKS = 0;

INSERT IGNORE INTO product_platforms (ProductID, BodyID)
SELECT ProductID, BodyID FROM products WHERE BodyID IS NOT NULL AND BodyID > 0;

SET SESSION FOREIGN_KEY_CHECKS = 1;
