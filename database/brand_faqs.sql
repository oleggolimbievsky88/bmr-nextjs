-- Brand-specific FAQs in brand_core.
-- Run: mysql -u user -p brand_core < database/brand_faqs.sql

USE `brand_core`;

CREATE TABLE IF NOT EXISTS `brand_faqs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `brand_key` varchar(50) NOT NULL,
  `question` text NOT NULL,
  `answer` text NOT NULL,
  `sort_order` int unsigned NOT NULL DEFAULT 0,
  `section` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_brand_faqs_brand_key_sort` (`brand_key`, `sort_order`),
  CONSTRAINT `fk_brand_faqs_brand` FOREIGN KEY (`brand_key`) REFERENCES `brands` (`key`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
