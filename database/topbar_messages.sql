-- Topbar scrolling messages (HTML allowed, e.g. <a href>)
-- Prefer: node scripts/run-topbar-migration.cjs (creates table, adds duration/is_active, seeds)
-- Or run manually: mysql -u user -p database < database/topbar_messages.sql

CREATE TABLE IF NOT EXISTS `topbar_messages` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL,
  `sort_order` int unsigned NOT NULL DEFAULT 0,
  `duration` int unsigned NOT NULL DEFAULT 3000,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- duration: ms to show each slide (1000–60000). is_active: 0=hidden, 1=shown.

-- Seed with current default message
INSERT INTO `topbar_messages` (`content`, `sort_order`, `duration`, `is_active`)
SELECT 'FREE SHIPPING IN THE US FOR ALL BMR PRODUCTS!', 0, 3000, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `topbar_messages` LIMIT 1);
