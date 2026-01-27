-- Topbar scrolling messages (HTML allowed, e.g. <a href>)
-- Run: mysql -u user -p database < database/topbar_messages.sql

CREATE TABLE IF NOT EXISTS `topbar_messages` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL,
  `sort_order` int unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed with current default message
INSERT INTO `topbar_messages` (`content`, `sort_order`)
SELECT 'FREE SHIPPING IN THE US FOR ALL BMR PRODUCTS!', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `topbar_messages` LIMIT 1);
