-- Site-wide settings (key-value). Used e.g. for "new products display days".
CREATE TABLE IF NOT EXISTS `site_settings` (
  `setting_key` varchar(64) NOT NULL,
  `setting_value` text,
  PRIMARY KEY (`setting_key`)
);

-- Default: show new products for 90 days
INSERT IGNORE INTO `site_settings` (`setting_key`, `setting_value`) VALUES ('new_products_days', '90');
