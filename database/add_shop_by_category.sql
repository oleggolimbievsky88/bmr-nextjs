-- Add shop_by_category JSON column to brands (homepage "Shop by Category" cards).
-- Run: mysql -u user -p brand_core < database/add_shop_by_category.sql

USE `brand_core`;

ALTER TABLE `brands`
  ADD COLUMN `shop_by_category` json DEFAULT NULL
  AFTER `shop_by_make`;

-- Optional: seed default cards for existing brands (merge with DB seed if you prefer)
-- UPDATE `brands` SET `shop_by_category` = '{"sectionTitle":"Shop by Category","sectionSubtitle":"Browse our New Products, Merchandise, and Gift Cards.","items":[{"href":"/products/new","title":"New Products","subtitle":"Latest releases","img":"/images/shop-categories/NewProductsGradient.jpg"},{"href":"/products/bmr-merchandise","title":"BMR Merchandise","subtitle":"Apparel & more","img":"/images/shop-categories/MerchGradient.jpg"},{"href":"/products/gift-cards","title":"BMR Gift Cards","subtitle":"Perfect gift","img":"/images/shop-categories/GiftCardsGradient.jpg"}]}' WHERE `key` = 'bmr';
-- UPDATE `brands` SET `shop_by_category` = '{"sectionTitle":"Shop by Category","sectionSubtitle":"Browse our New Products, Merchandise, and Gift Cards.","items":[{"href":"/products/new","title":"New Products","subtitle":"Latest releases","img":"/images/shop-categories/NewProductsGradient.jpg"},{"href":"/products/bmr-merchandise","title":"BMR Merchandise","subtitle":"Apparel & more","img":"/images/shop-categories/MerchGradient.jpg"},{"href":"/products/gift-cards","title":"BMR Gift Cards","subtitle":"Perfect gift","img":"/images/shop-categories/GiftCardsGradient.jpg"}]}' WHERE `key` = 'controlfreak';
