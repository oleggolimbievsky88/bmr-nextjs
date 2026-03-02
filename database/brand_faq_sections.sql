-- Brand FAQ section headings (editable per brand). Run after brand_faqs.sql.
-- Run: mysql -u user -p brand_core < database/brand_faq_sections.sql

USE `brand_core`;

CREATE TABLE IF NOT EXISTS `brand_faq_sections` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `brand_key` varchar(50) NOT NULL,
  `section_key` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `sort_order` int unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_brand_faq_sections_brand_key` (`brand_key`, `section_key`),
  KEY `idx_brand_faq_sections_brand_sort` (`brand_key`, `sort_order`),
  CONSTRAINT `fk_brand_faq_sections_brand` FOREIGN KEY (`brand_key`) REFERENCES `brands` (`key`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
