-- Per-product per-vehicle fitment (catalog DB, same as products).
-- Run: mysql -u user -p your_catalog_db < database/product_vehicle_fitment.sql

CREATE TABLE IF NOT EXISTS `product_vehicle_fitment` (
  `ProductID` int unsigned NOT NULL,
  `VehicleID` int unsigned NOT NULL,
  `included` tinyint(1) NOT NULL DEFAULT 1,
  `fit_start_year` int DEFAULT NULL,
  `fit_end_year` int DEFAULT NULL,
  PRIMARY KEY (`ProductID`, `VehicleID`),
  KEY `idx_pvf_vehicle` (`VehicleID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
