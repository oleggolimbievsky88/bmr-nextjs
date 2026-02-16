-- Wishlist table: stores product IDs per customer
-- Run this to add wishlist support for logged-in users
--
-- If you get a foreign key error, the table will still work without the FK.
-- Match charset to your customers table if needed (e.g. latin1 vs utf8mb4).

CREATE TABLE IF NOT EXISTS `customer_wishlist` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `customerId` INT UNSIGNED NOT NULL,
  `productId` INT UNSIGNED NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customer_product` (`customerId`, `productId`),
  KEY `customerId` (`customerId`),
  KEY `productId` (`productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: add FK for referential integrity (run only if above succeeds)
-- ALTER TABLE `customer_wishlist`
-- ADD CONSTRAINT `fk_wishlist_customer`
-- FOREIGN KEY (`customerId`) REFERENCES `customers` (`CustomerID`) ON DELETE CASCADE;
