-- Alternative backfill for product_platforms: run in batches to avoid timeout.
-- Use this only if the single INSERT in product_platforms_junction.sql gets interrupted.
--
-- Prerequisite: product_platforms table must already exist (run Step 1 of product_platforms_junction.sql).
--
-- Run the INSERT below repeatedly until it reports "0 rows affected". Then all rows are backfilled.

SET SESSION FOREIGN_KEY_CHECKS = 0;

INSERT IGNORE INTO product_platforms (ProductID, BodyID)
SELECT p.ProductID, p.BodyID
FROM products p
LEFT JOIN product_platforms pp ON pp.ProductID = p.ProductID AND pp.BodyID = p.BodyID
WHERE p.BodyID IS NOT NULL AND p.BodyID > 0 AND pp.ProductID IS NULL
LIMIT 2000;

SET SESSION FOREIGN_KEY_CHECKS = 1;
