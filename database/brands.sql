-- Brand configuration (editable via admin; file defaults used as fallback)
-- Run: mysql -u user -p database < database/brands.sql

CREATE TABLE IF NOT EXISTS `brands` (
  `key` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `company_name` varchar(255) NOT NULL DEFAULT '',
  `company_name_short` varchar(100) NOT NULL DEFAULT '',
  `site_url` varchar(500) NOT NULL DEFAULT '',
  `assets_base_url` varchar(500) NOT NULL DEFAULT '',
  `theme_color` varchar(20) NOT NULL DEFAULT '#0d6efd',
  `button_badge_color` varchar(20) NOT NULL DEFAULT '',
  `button_badge_text_color` varchar(20) NOT NULL DEFAULT '',
  `primary_button_text_color` varchar(20) NOT NULL DEFAULT '',
  `assurance_bar_background_color` varchar(20) NOT NULL DEFAULT '',
  `assurance_bar_text_color` varchar(20) NOT NULL DEFAULT '',
  `default_title` varchar(255) NOT NULL DEFAULT '',
  `default_description` text,
  `favicon_path` varchar(500) NOT NULL DEFAULT '',
  `og_image_path` varchar(500) NOT NULL DEFAULT '',
  `default_og_image_path` varchar(500) NOT NULL DEFAULT '',
  `copyright_name` varchar(255) NOT NULL DEFAULT '',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `logo` json DEFAULT NULL,
  `contact` json DEFAULT NULL,
  `social` json DEFAULT NULL,
  `assurance_bar_items` json DEFAULT NULL,
  `about_brand` json DEFAULT NULL,
  `same_as` json DEFAULT NULL,
  `shop_by_make` json DEFAULT NULL,
  `nav_labels` json DEFAULT NULL,
  `nav_urls` json DEFAULT NULL,
  `nav_order` json DEFAULT NULL,
  `nav_platform_ids` json DEFAULT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed BMR
INSERT INTO `brands` (
  `key`, `name`, `company_name`, `company_name_short`, `site_url`, `assets_base_url`,
  `theme_color`, `button_badge_color`, `button_badge_text_color`, `primary_button_text_color`,
  `assurance_bar_background_color`, `assurance_bar_text_color`,
  `default_title`, `default_description`, `favicon_path`, `og_image_path`, `default_og_image_path`,
  `copyright_name`, `is_active`,
  `logo`, `contact`, `social`, `assurance_bar_items`, `about_brand`, `same_as`, `shop_by_make`,   `nav_labels`, `nav_urls`, `nav_order`, `nav_platform_ids`
) VALUES (
  'bmr', 'BMR Suspension', 'BMR Suspension', 'BMR', '', '',
  '#fe0000', '#fe0000', '#ffffff', '#ffffff',
  '#f5f5f5', '#1a1a1a',
  'BMR Suspension | Performance Suspension & Chassis Parts',
  'BMR Suspension manufactures high-performance suspension and chassis parts for Mustang, Camaro, GM, Mopar, and more. Shop rear control arms, sway bars, springs, and race-proven components.',
  '/brands/bmr/favicons/favicon.svg', '/brands/bmr/images/logo/BMR-Logo.jpg', '/og/bmr-og.jpg',
  'BMR Suspension', 1,
  '{"headerPath":"/brands/bmr/images/logo/BMR-Logo-White.png","footerPath":"/brands/bmr/images/logo/BMR-Logo-White.png","headerMaxSize":{"maxWidth":"200px","maxHeight":"50px"},"footerMaxSize":{"maxWidth":"240px","maxHeight":"60px"},"alt":"BMR Logo"}',
  '{"addressLines":["1033 Pine Chase Ave","Lakeland, FL 33815"],"email":"sales@bmrsuspension.com","phoneDisplay":"(813) 986-9302","phoneTel":"8139869302"}',
  '{"facebook":"https://www.facebook.com/BMRSuspensionInc/","instagram":"https://www.instagram.com/bmrsuspension/","youtube":"https://www.youtube.com/@BMRSuspension","tiktok":"https://www.tiktok.com/@bmrsuspension"}',
  '[{"iconClass":"icon-shipping","title":"Free Shipping","description":"Free shipping to the 48 continental U.S. states on all BMR products."},{"iconClass":"icon-payment fs-22","title":"Flexible Payment","description":"Pay with Credit, Debit, or PayPal"},{"iconClass":"icon-return fs-20","title":"90 Day Returns","description":"Subject to a 15% restocking fee"},{"iconClass":"icon-suport","title":"Premium Support","description":"Outstanding premium support"}]',
  NULL,
  '[]',
  '{"sectionTitle":"Shop by Make","sectionSubtitle":"Find parts for Ford, GM, and Dodge platforms.","items":[{"imagePath":"/images/logo/Ford_Logo.png","title":"FORD","link":"products/ford","shopNowLabel":"SHOP NOW"},{"imagePath":"/images/logo/gm_logo.png","title":"GM","link":"products/gm","shopNowLabel":"SHOP NOW"},{"imagePath":"/images/logo/dodge_logo.png","title":"Dodge","link":"products/mopar","shopNowLabel":"SHOP NOW"}]}',
  '{"ford":"Ford","gmLateModel":"GM Late Model Cars","gmMidMuscle":"GM Mid Muscle Cars","gmClassicMuscle":"GM Classic Muscle Cars","mopar":"Mopar","installation":"Installation","cart":"Cart"}',
  '{"ford":"/products/ford","gmLateModel":"/products/gm/late-model","gmMidMuscle":"/products/gm/mid-muscle","gmClassicMuscle":"/products/gm/classic-muscle","mopar":"/products/mopar","installation":"/installation","cart":"/view-cart"}',
  '["ford","gmLateModel","gmMidMuscle","gmClassicMuscle","mopar","installation","cart"]',
  '["ford","gmLateModel","gmMidMuscle","gmClassicMuscle","mopar"]'
) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Seed Control Freak
INSERT INTO `brands` (
  `key`, `name`, `company_name`, `company_name_short`, `site_url`, `assets_base_url`,
  `theme_color`, `button_badge_color`, `button_badge_text_color`, `primary_button_text_color`,
  `assurance_bar_background_color`, `assurance_bar_text_color`,
  `default_title`, `default_description`, `favicon_path`, `og_image_path`, `default_og_image_path`,
  `copyright_name`, `is_active`,
  `logo`, `contact`, `social`, `assurance_bar_items`, `about_brand`, `same_as`, `shop_by_make`, `nav_labels`, `nav_urls`, `nav_order`, `nav_platform_ids`
) VALUES (
  'controlfreak', 'Control Freak Suspension', 'Control Freak Suspension', 'Control Freak', '', '',
  '#ffec01', '#ffec01', '#000000', '#000000',
  '#ffec01', '#000000',
  'Control Freak Suspension | World Class Suspensions for the Best Price',
  'Control Freak Suspension offers World Class Suspensions for the Best Price',
  '/brands/controlfreak/favicons/ControlFreakLogo.svg', '/brands/controlfreak/images/CFS_logo.png', '/og/controlfreak-og.jpg',
  'Control Freak Suspension', 1,
  '{"headerPath":"/brands/controlfreak/images/logo/ControlFreakSuspensionLogo.png","footerPath":"/brands/controlfreak/images/logo/ControlFreakSuspensionLogo.png","headerMaxSize":{"maxWidth":"145px","maxHeight":"70px"},"footerMaxSize":{"maxWidth":"240px","maxHeight":"70px"},"alt":"Control Freak Logo"}',
  '{"addressLines":["1033 Pine Chase Ave","Lakeland, FL 33815"],"email":"sales@freakride.com","phoneDisplay":"(407) 696-2772","phoneTel":"4076962772"}',
  '{}',
  '[{"iconClass":"icon-shipping","title":"Free Shipping","description":"Free shipping on all Control Freak products."},{"iconClass":"icon-payment fs-22","title":"Flexible Payment","description":"Pay with Credit, Debit, or PayPal"},{"iconClass":"icon-return fs-20","title":"90 Day Returns","description":"Subject to a 15% restocking fee"},{"iconClass":"icon-suport","title":"Tech Help","description":"8:30-5:30 PM EST"}]',
  '{"heading":"About Control Freak Suspension","paragraphs":["Control Freak Suspension was founded in 2000 as an addition to a hot rod and muscle car shop. As builders, we just were not satisfied with the aftermarket suspension offerings of the day, so we designed, developed, and manufactured our own. Just two years later, Control Freak Suspension was spun off as its own company and label with its own facilities and staff. We''ve been in continuous operation since then.","Our mission is simple: design, develop, and manufacture world-class suspension systems at a responsive price.","All of our products are manufactured in-house at our central Florida facilities to uphold the high quality you know and trust. Whether it''s a weekend cruiser or a dedicated track car, we have the parts you need to upgrade your classic ride with modern handling and performance."],"ctaLabel":"Contact Support","ctaHref":"/contact"}',
  '[]',
  '{"sectionTitle":"Shop by Make","sectionSubtitle":"Find parts for Ford, GM, and Dodge platforms.","items":[{"imagePath":"/images/logo/Ford_Logo.png","title":"FORD","link":"products/ford","shopNowLabel":"SHOP NOW"},{"imagePath":"/images/logo/gm_logo.png","title":"GM","link":"products/gm","shopNowLabel":"SHOP NOW"},{"imagePath":"/images/logo/dodge_logo.png","title":"Dodge","link":"products/mopar","shopNowLabel":"SHOP NOW"}]}',
  '{"ford":"Ford","gmLateModel":"GM Late Model Cars","gmMidMuscle":"GM Mid Muscle Cars","gmClassicMuscle":"GM Classic Muscle Cars","mopar":"Mopar","installation":"Installation","cart":"Cart"}',
  '{"ford":"/products/ford","gmLateModel":"/products/gm/late-model","gmMidMuscle":"/products/gm/mid-muscle","gmClassicMuscle":"/products/gm/classic-muscle","mopar":"/products/mopar","installation":"/installation","cart":"/view-cart"}',
  '["ford","gmLateModel","gmMidMuscle","gmClassicMuscle","mopar","installation","cart"]',
  '["ford","gmLateModel","gmMidMuscle","gmClassicMuscle","mopar"]'
) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
