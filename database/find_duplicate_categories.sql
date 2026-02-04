-- Find duplicate categories (same main category + same slug or same name)
-- Run in MySQL Workbench against your bmrsuspension database.
-- Duplicates can cause two sidebar entries and "no products" when the wrong CatID is used.

-- 1) Duplicates by effective slug (same MainCatID + same URL slug)
--    Uses CatNameSlug when set, otherwise slug from CatName (e.g. "Vertical Links" -> vertical-links)
SELECT
    c.MainCatID,
    mc.MainCatName,
    COALESCE(NULLIF(TRIM(c.CatNameSlug), ''), LOWER(REPLACE(TRIM(c.CatName), ' ', '-'))) AS slug_used,
    COUNT(*) AS duplicate_count,
    GROUP_CONCAT(c.CatID ORDER BY c.CatID) AS CatIDs,
    GROUP_CONCAT(c.CatName ORDER BY c.CatID) AS CatNames,
    GROUP_CONCAT(COALESCE(c.CatNameSlug, '(empty)') ORDER BY c.CatID) AS CatNameSlugs
FROM categories c
JOIN maincategories mc ON mc.MainCatID = c.MainCatID
GROUP BY
    c.MainCatID,
    mc.MainCatName,
    COALESCE(NULLIF(TRIM(c.CatNameSlug), ''), LOWER(REPLACE(TRIM(c.CatName), ' ', '-')))
HAVING COUNT(*) > 1
ORDER BY c.MainCatID, duplicate_count DESC;

-- 2) Simpler: duplicates by exact CatName within same main category
SELECT
    c.MainCatID,
    mc.MainCatName,
    c.CatName,
    COUNT(*) AS duplicate_count,
    GROUP_CONCAT(c.CatID ORDER BY c.CatID) AS CatIDs,
    GROUP_CONCAT(COALESCE(c.CatNameSlug, '') ORDER BY c.CatID) AS CatNameSlugs
FROM categories c
JOIN maincategories mc ON mc.MainCatID = c.MainCatID
GROUP BY c.MainCatID, c.CatName, mc.MainCatName
HAVING COUNT(*) > 1
ORDER BY c.MainCatID, c.CatName;

-- 3) Same as (2) but with product counts per category (so you can see which ID has products)
SELECT
    c.MainCatID,
    mc.MainCatName,
    c.CatName,
    c.CatID,
    COALESCE(c.CatNameSlug, '') AS CatNameSlug,
    COUNT(DISTINCT p.ProductID) AS product_count
FROM categories c
JOIN maincategories mc ON mc.MainCatID = c.MainCatID
LEFT JOIN products p ON FIND_IN_SET(c.CatID, p.CatID) AND p.Display = 1 AND p.EndProduct != 1
WHERE (c.MainCatID, c.CatName) IN (
    SELECT MainCatID, CatName
    FROM categories
    GROUP BY MainCatID, CatName
    HAVING COUNT(*) > 1
)
GROUP BY c.MainCatID, mc.MainCatName, c.CatName, c.CatID, c.CatNameSlug
ORDER BY c.MainCatID, c.CatName, c.CatID;
