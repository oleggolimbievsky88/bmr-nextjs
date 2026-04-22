-- Universal platform + minimal taxonomy for /products/universal (catalog DB).
-- Safe to re-run (idempotent checks).
-- Prefer backfilling platform_groups from bodycats (vehicles_platform_groups_migration.sql).
-- If platform_groups is empty, COALESCE(MIN(id), 1) used to set BodyCatID=1 with no matching
-- row (FK errors or bad data). We insert one minimal group first so BodyCatID always resolves.

INSERT INTO `platform_groups` (`name`, `position`)
SELECT 'Universal', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `platform_groups`);

INSERT INTO `platforms` (
  `Name`, `StartYear`, `EndYear`, `Image`, `PlatformOrder`, `BodyCatID`, `HeaderImage`, `slug`
)
SELECT
  'Universal Kits',
  1900,
  2035,
  '0',
  0,
  (SELECT MIN(`id`) FROM `platform_groups`),
  '0',
  'universal'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `platforms` WHERE `slug` = 'universal');

SET @universal_pid := (SELECT `PlatformID` FROM `platforms` WHERE `slug` = 'universal' LIMIT 1);

INSERT INTO `maincategories` (`BodyID`, `MainCatImage`, `MainCatName`, `MainCatSlug`)
SELECT @universal_pid, '0', 'Suspension Kits', 'suspension-kits'
FROM DUAL
WHERE @universal_pid IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM `maincategories`
    WHERE `BodyID` = @universal_pid AND `MainCatSlug` = 'suspension-kits'
  );

SET @universal_mcid := (
  SELECT `MainCatID` FROM `maincategories`
  WHERE `BodyID` = @universal_pid AND `MainCatSlug` = 'suspension-kits'
  LIMIT 1
);

INSERT INTO `categories` (`CatName`, `CatImage`, `MainCatID`, `ParentID`, `CatNameSlug`)
SELECT 'All Kits', '0', @universal_mcid, 0, 'all-kits'
FROM DUAL
WHERE @universal_mcid IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM `categories`
    WHERE `MainCatID` = @universal_mcid AND `CatNameSlug` = 'all-kits'
  );
