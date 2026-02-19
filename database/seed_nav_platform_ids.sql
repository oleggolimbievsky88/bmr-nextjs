-- Backfill nav_platform_ids so mega menu checkboxes show checked in admin.
-- Run if brands already exist but nav_platform_ids is NULL/empty:
--   mysql -u user -p database < database/seed_nav_platform_ids.sql

UPDATE `brands` SET `nav_platform_ids` = '["ford","gmLateModel","gmMidMuscle","gmClassicMuscle","mopar"]'
WHERE `key` IN ('bmr', 'controlfreak') AND (`nav_platform_ids` IS NULL OR `nav_platform_ids` = '[]' OR `nav_platform_ids` = 'null');
