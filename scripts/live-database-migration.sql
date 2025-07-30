-- Migration script for live database
-- Run this in your production MySQL database

-- Step 1: Add CatSlug column if it doesn't exist
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS CatSlug VARCHAR(255) NOT NULL DEFAULT '';

-- Step 2: Generate slugs from category names
UPDATE categories
SET CatSlug = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    CatName,
    ' ', '-'),
    '&', 'and'),
    '/', '-'),
    '(', ''),
    ')', ''),
    ',', ''),
    '.', ''),
    "'", ''),
    '"', ''),
    '--', '-'))
WHERE CatSlug = '' OR CatSlug IS NULL;

-- Step 3: Remove any CatID suffixes (clean up duplicates)
UPDATE categories
SET CatSlug = REGEXP_REPLACE(CatSlug, '-[0-9]+$', '')
WHERE CatSlug REGEXP '-[0-9]+$';

-- Step 4: Check results
SELECT CatID, CatName, CatSlug
FROM categories
WHERE CatSlug != ''
ORDER BY CatName
LIMIT 10;

-- Step 5: Check for remaining duplicates (optional)
SELECT CatSlug, COUNT(*) as count, GROUP_CONCAT(CatID) as cat_ids
FROM categories
WHERE CatSlug != ''
GROUP BY CatSlug
HAVING COUNT(*) > 1
ORDER BY count DESC
LIMIT 5;