-- Add SubModel column to vehicles for Search by Vehicle sub-model filtering.
-- Run: mysql -u user -p database < database/vehicles_add_submodel.sql
-- If you get "Duplicate column name 'SubModel'", the column already exists.

ALTER TABLE vehicles
  ADD COLUMN SubModel VARCHAR(255) NULL AFTER Model;
