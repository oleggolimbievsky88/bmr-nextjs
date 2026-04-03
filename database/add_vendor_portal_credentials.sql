-- Store vendor portal login per brand in brand_core.
-- Run: mysql -u user -p brand_core < database/add_vendor_portal_credentials.sql

USE `brand_core`;

CREATE TABLE IF NOT EXISTS `vendor_portal_credentials` (
  `brand_key` varchar(50) NOT NULL,
  `username` varchar(255) NOT NULL DEFAULT '',
  `password_hash` varchar(255) NOT NULL DEFAULT '',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`brand_key`),
  CONSTRAINT `fk_vendor_portal_credentials_brand`
    FOREIGN KEY (`brand_key`) REFERENCES `brands` (`key`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

