-- Add grease, angle finder, hardware to dealer PO line items (optional add-ons per line).
-- Run once; if columns already exist, ignore the error.

ALTER TABLE dealer_po_items
  ADD COLUMN grease_id int unsigned DEFAULT NULL COMMENT 'grease.GreaseID',
  ADD COLUMN grease_name varchar(100) DEFAULT NULL,
  ADD COLUMN anglefinder_id int unsigned DEFAULT NULL COMMENT 'anglefinder.AngleID',
  ADD COLUMN anglefinder_name varchar(100) DEFAULT NULL,
  ADD COLUMN hardware_id int unsigned DEFAULT NULL COMMENT 'hardware.HardwareID',
  ADD COLUMN hardware_name varchar(100) DEFAULT NULL;
