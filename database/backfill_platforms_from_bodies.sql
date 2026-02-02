-- Backfill platforms table from bodies and set slugs for NULL entries.
-- Run this after adding new platforms via the old ColdFusion site (bodies only).
-- Uses BodyID as PlatformID so product/maincategory queries (which use BodyID) work.
--
-- Slug format matches app: startYear-endYear-lowercase-name, spaces/slashes -> hyphens.
-- Example: "2006 - 2013 Corvette Z06/ZR1" -> "2006-2013-corvette-z06-zr1"

-- 1) Insert any bodies that don't yet exist in platforms (e.g. Corvette Z06/ZR1, Corvette Z06).
INSERT INTO platforms (
  PlatformID,
  Name,
  StartYear,
  EndYear,
  Image,
  PlatformOrder,
  BodyCatID,
  HeaderImage,
  slug
)
SELECT
  b.BodyID,
  b.Name,
  b.StartYear,
  b.EndYear,
  b.Image,
  b.BodyOrder,
  b.BodyCatID,
  b.HeaderImage,
  LOWER(CONCAT(
    TRIM(b.StartYear), '-', TRIM(b.EndYear), '-',
    REPLACE(REPLACE(TRIM(b.Name), ' ', '-'), '/', '-')
  ))
FROM bodies b
LEFT JOIN platforms p ON p.PlatformID = b.BodyID
WHERE p.PlatformID IS NULL;

-- 2) Set slug where NULL (e.g. existing platform rows added without slug)
UPDATE platforms p
SET p.slug = LOWER(CONCAT(
  TRIM(p.StartYear), '-', TRIM(p.EndYear), '-',
  REPLACE(REPLACE(TRIM(p.Name), ' ', '-'), '/', '-')
))
WHERE p.slug IS NULL OR TRIM(IFNULL(p.slug, '')) = '';
