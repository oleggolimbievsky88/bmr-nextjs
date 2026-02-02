-- Rename BodyOrder to PlatformOrder in platforms table (matches schema and menu query).
-- Run only if platforms has BodyOrder and not PlatformOrder.

ALTER TABLE platforms
  CHANGE COLUMN BodyOrder PlatformOrder int unsigned NOT NULL DEFAULT 0;
