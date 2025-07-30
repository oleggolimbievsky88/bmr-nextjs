-- Add slug column to categories table
ALTER TABLE categories ADD COLUMN CatSlug VARCHAR(255) NOT NULL DEFAULT '';

-- Create slugs from existing category names
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
WHERE CatSlug = '';

-- Handle duplicates by appending platform info or numbers
-- This query identifies duplicates that need manual review
SELECT CatSlug, COUNT(*) as count, GROUP_CONCAT(CatID) as cat_ids, GROUP_CONCAT(CatName) as names
FROM categories
GROUP BY CatSlug
HAVING COUNT(*) > 1;