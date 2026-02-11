-- Add scheduling and default-banner support to banner table.
-- Run once in MySQL Workbench: execute the single ALTER below.

ALTER TABLE banner
  ADD COLUMN display_start DATETIME NULL,
  ADD COLUMN display_end   DATETIME NULL,
  ADD COLUMN is_default    TINYINT(1) NOT NULL DEFAULT 0;

-- Optional: set one banner as default (e.g. bannerid 1)
-- UPDATE banner SET is_default = 1 WHERE bannerid = 1 LIMIT 1;
