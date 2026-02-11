-- Vehicles / Platform groups migration
-- Run in MySQL Workbench (execute each section or the whole file).
-- 1) Create platform_groups and copy from bodycats (same IDs so bodies can reference them)

CREATE TABLE IF NOT EXISTS platform_groups (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  position INT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Copy bodycats into platform_groups (preserve BodyCatID as id so bodies.BodyCatID matches)
INSERT IGNORE INTO platform_groups (id, name, position)
  SELECT BodyCatID, BodyCatName, Position FROM bodycats;

-- 2) Add platform_group_id to bodies and backfill from BodyCatID
ALTER TABLE bodies
  ADD COLUMN platform_group_id INT UNSIGNED NULL AFTER BodyCatID;

UPDATE bodies SET platform_group_id = CAST(BodyCatID AS UNSIGNED) WHERE BodyCatID IS NOT NULL AND BodyCatID != '' AND BodyCatID != '0';

ALTER TABLE bodies ADD KEY idx_platform_group_id (platform_group_id);

-- 3) Add SubModel to vehicles
ALTER TABLE vehicles
  ADD COLUMN SubModel VARCHAR(255) NULL AFTER Model;

-- 4) Indexes for vehicles (bodies.slug already has idx_slug)
-- Run each line separately. If "Duplicate key name", index exists—skip that line.
CREATE INDEX idx_vehicles_body_year ON vehicles (BodyID, StartYear, EndYear);
CREATE INDEX idx_vehicles_make_model ON vehicles (Make, Model);
