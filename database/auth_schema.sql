-- Authentication and User Management Schema
-- This extends the existing customers table with authentication features

-- Add columns to customers table for authentication
-- Note: Run these one at a time if you get errors about existing columns

ALTER TABLE `customers` 
ADD COLUMN `emailVerified` DATETIME NULL DEFAULT NULL;

ALTER TABLE `customers` 
ADD COLUMN `role` ENUM('customer', 'dealer', 'admin') NOT NULL DEFAULT 'customer';

ALTER TABLE `customers` 
ADD COLUMN `dealerTier` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0 = customer, 1-5 = dealer discount tiers';

ALTER TABLE `customers` 
ADD COLUMN `dealerDiscount` DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Percentage discount for dealers';

ALTER TABLE `customers` 
ADD COLUMN `image` VARCHAR(255) DEFAULT NULL;

ALTER TABLE `customers` 
ADD COLUMN `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE `customers` 
ADD COLUMN `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Create email verification tokens table
CREATE TABLE `verification_tokens` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `customerId` INT UNSIGNED NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `type` ENUM('email_verification', 'password_reset') NOT NULL,
  `expires` DATETIME NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `customerId` (`customerId`),
  KEY `expires` (`expires`),
  CONSTRAINT `fk_verification_customer` FOREIGN KEY (`customerId`) REFERENCES `customers` (`CustomerID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create OAuth accounts table for social login
CREATE TABLE `accounts` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `customerId` INT UNSIGNED NOT NULL,
  `provider` VARCHAR(50) NOT NULL,
  `providerAccountId` VARCHAR(255) NOT NULL,
  `accessToken` TEXT,
  `refreshToken` TEXT,
  `expiresAt` INT,
  `tokenType` VARCHAR(50),
  `scope` VARCHAR(255),
  `idToken` TEXT,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `provider_providerAccountId` (`provider`, `providerAccountId`),
  KEY `customerId` (`customerId`),
  CONSTRAINT `fk_accounts_customer` FOREIGN KEY (`customerId`) REFERENCES `customers` (`CustomerID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create sessions table for NextAuth
CREATE TABLE `sessions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `sessionToken` VARCHAR(255) NOT NULL,
  `customerId` INT UNSIGNED NOT NULL,
  `expires` DATETIME NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sessionToken` (`sessionToken`),
  KEY `customerId` (`customerId`),
  KEY `expires` (`expires`),
  CONSTRAINT `fk_sessions_customer` FOREIGN KEY (`customerId`) REFERENCES `customers` (`CustomerID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index for faster email lookups
-- Note: These may fail if indexes already exist - that's okay
CREATE INDEX `idx_customers_email` ON `customers` (`email`);
CREATE INDEX `idx_customers_role` ON `customers` (`role`);
