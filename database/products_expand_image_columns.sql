-- Expand ImageSmall and ImageLarge to support Vercel Blob URLs (serverless deployments).
-- Blob URLs are ~100-200 chars; varchar(45) was for short filenames only.
-- Run: mysql -u user -p database < database/products_expand_image_columns.sql

ALTER TABLE `products`
  MODIFY COLUMN `ImageSmall` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  MODIFY COLUMN `ImageLarge` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0';
