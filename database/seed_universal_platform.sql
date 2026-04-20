-- Universal platform + minimal taxonomy for /products/universal (catalog DB).
-- Run after platform_groups exists. Safe to re-run (idempotent checks).

INSERT INTO `platforms` (
  `Name`, `StartYear`, `EndYear`, `Image`, `PlatformOrder`, `BodyCatID`, `HeaderImage`, `slug`
)
SELECT
  'Universal Kits',
  1900,
  2035,
  '0',
  0,
  COALESCE((SELECT MIN(`id`) FROM `platform_groups`), 1),
  '0',
  'universal'
WHERE NOT EXISTS (SELECT 1 FROM `platforms` WHERE `slug` = 'universal');

SET @universal_pid := (SELECT `PlatformID` FROM `platforms` WHERE `slug` = 'universal' LIMIT 1);

INSERT INTO `maincategories` (`BodyID`, `MainCatImage`, `MainCatName`, `MainCatSlug`)
SELECT @universal_pid, '0', 'Suspension Kits', 'suspension-kits'
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
WHERE @universal_mcid IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM `categories`
    WHERE `MainCatID` = @universal_mcid AND `CatNameSlug` = 'all-kits'
  );
