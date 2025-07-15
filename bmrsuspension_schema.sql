CREATE DATABASE  IF NOT EXISTS `bmrsuspension` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `bmrsuspension`;
-- MySQL dump 10.13  Distrib 8.4.5, for Linux (x86_64)
--
-- Host: localhost    Database: bmrsuspension
-- ------------------------------------------------------
-- Server version	8.4.5

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `anglefinder`
--

DROP TABLE IF EXISTS `anglefinder`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `anglefinder` (
  `AngleID` int unsigned NOT NULL AUTO_INCREMENT,
  `AngleName` varchar(45) NOT NULL DEFAULT '0',
  `AnglePrice` varchar(45) DEFAULT '0',
  PRIMARY KEY (`AngleID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `banner`
--

DROP TABLE IF EXISTS `banner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banner` (
  `bannerid` int unsigned NOT NULL AUTO_INCREMENT,
  `bannername` varchar(455) NOT NULL,
  `bannersize` varchar(45) NOT NULL DEFAULT '230x800',
  `bannerimages` varchar(4440) NOT NULL DEFAULT '0',
  `filecount` int unsigned NOT NULL DEFAULT '15',
  `display` int unsigned NOT NULL DEFAULT '0',
  `bannerlinks` varchar(4455) DEFAULT '0',
  `bannerspeed` varchar(45) DEFAULT '0',
  PRIMARY KEY (`bannerid`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bannerimages`
--

DROP TABLE IF EXISTS `bannerimages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bannerimages` (
  `ImageId` int unsigned NOT NULL AUTO_INCREMENT,
  `ImageSrc` varchar(255) DEFAULT NULL,
  `ImageUrl` varchar(455) DEFAULT NULL,
  `ImagePosition` int unsigned NOT NULL,
  `bannerid` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`ImageId`,`ImagePosition`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bodies`
--

DROP TABLE IF EXISTS `bodies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bodies` (
  `BodyID` int unsigned NOT NULL AUTO_INCREMENT,
  `Name` varchar(45) NOT NULL DEFAULT '0',
  `StartYear` varchar(45) NOT NULL DEFAULT '0',
  `EndYear` varchar(45) NOT NULL DEFAULT '0',
  `Image` varchar(445) NOT NULL DEFAULT '0',
  `BodyOrder` int unsigned NOT NULL DEFAULT '0',
  `BodyCatID` varchar(45) NOT NULL DEFAULT '0',
  `HeaderImage` varchar(455) NOT NULL DEFAULT '0',
  `handle` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`BodyID`),
  KEY `idx_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bodycats`
--

DROP TABLE IF EXISTS `bodycats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bodycats` (
  `BodyCatID` int unsigned NOT NULL AUTO_INCREMENT,
  `BodyCatName` varchar(455) NOT NULL,
  `Position` int unsigned DEFAULT NULL,
  PRIMARY KEY (`BodyCatID`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `CatID` int unsigned NOT NULL AUTO_INCREMENT,
  `CatName` varchar(45) NOT NULL,
  `CatImage` varchar(45) NOT NULL DEFAULT '0',
  `MainCatID` varchar(45) NOT NULL DEFAULT '0',
  `ParentID` int unsigned NOT NULL DEFAULT '0',
  `CatNameSlug` varchar(45) NOT NULL DEFAULT '0',
  PRIMARY KEY (`CatID`)
) ENGINE=InnoDB AUTO_INCREMENT=763 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `colors`
--

DROP TABLE IF EXISTS `colors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `colors` (
  `ColorID` int unsigned NOT NULL AUTO_INCREMENT,
  `ColorName` varchar(45) NOT NULL DEFAULT '0',
  `ColorPrice` varchar(45) NOT NULL DEFAULT '0',
  `ColorImg` varchar(45) NOT NULL DEFAULT '0',
  `ColorImgLarge` varchar(45) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ColorID`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `couponbox`
--

DROP TABLE IF EXISTS `couponbox`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `couponbox` (
  `CouponBoxID` int unsigned NOT NULL AUTO_INCREMENT,
  `CouponDate` varchar(45) NOT NULL DEFAULT '0',
  `CouponBox` varchar(455) NOT NULL DEFAULT '0',
  `SessionCustomer` varchar(45) NOT NULL DEFAULT '0',
  `CartLen` varchar(45) NOT NULL DEFAULT '0',
  `CouponDiscount` varchar(45) NOT NULL DEFAULT '0',
  PRIMARY KEY (`CouponBoxID`)
) ENGINE=InnoDB AUTO_INCREMENT=233505 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `couponhistory`
--

DROP TABLE IF EXISTS `couponhistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `couponhistory` (
  `CouponHistoryID` int unsigned NOT NULL AUTO_INCREMENT,
  `CouponName` varchar(445) NOT NULL DEFAULT '0',
  `Value` varchar(45) NOT NULL DEFAULT '0',
  `StartDate` varchar(45) NOT NULL DEFAULT '0',
  `EndDate` varchar(45) NOT NULL DEFAULT '0',
  `CatID` varchar(45) NOT NULL DEFAULT '0',
  `ProductID` varchar(45) NOT NULL DEFAULT '0',
  `CouponCode` varchar(999) NOT NULL DEFAULT '0',
  `BodyID` varchar(45) NOT NULL DEFAULT '0',
  `Type` varchar(445) NOT NULL DEFAULT '0',
  `ValueType` varchar(45) NOT NULL DEFAULT '0',
  `CouponID` varchar(45) NOT NULL DEFAULT '0',
  `InvoiceID` varchar(45) NOT NULL DEFAULT '0',
  `domhandling` varchar(45) NOT NULL DEFAULT '0',
  PRIMARY KEY (`CouponHistoryID`)
) ENGINE=InnoDB AUTO_INCREMENT=15330 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `couponrules`
--

DROP TABLE IF EXISTS `couponrules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `couponrules` (
  `couponRuleId` int unsigned NOT NULL AUTO_INCREMENT,
  `couponId` int unsigned NOT NULL DEFAULT '0',
  `type` varchar(45) NOT NULL DEFAULT '0',
  `valueType` varchar(45) NOT NULL DEFAULT '0',
  `value` varchar(45) NOT NULL DEFAULT '0',
  `manId` varchar(100) NOT NULL DEFAULT '0',
  `bodyId` varchar(100) NOT NULL DEFAULT '0',
  `catId` varchar(100) NOT NULL DEFAULT '0',
  `productId` varchar(100) NOT NULL DEFAULT '0',
  PRIMARY KEY (`couponRuleId`)
) ENGINE=InnoDB AUTO_INCREMENT=197 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `CouponID` int unsigned NOT NULL AUTO_INCREMENT,
  `CouponName` varchar(445) NOT NULL DEFAULT '0',
  `Value` varchar(45) NOT NULL DEFAULT '0',
  `StartDate` varchar(45) NOT NULL DEFAULT '0',
  `EndDate` varchar(45) NOT NULL DEFAULT '0',
  `CatID` varchar(45) NOT NULL DEFAULT '0',
  `ProductID` varchar(45) NOT NULL DEFAULT '0',
  `CouponCode` varchar(999) NOT NULL DEFAULT '0',
  `BodyID` varchar(45) NOT NULL DEFAULT '0',
  `Type` varchar(445) NOT NULL DEFAULT '0',
  `ValueType` varchar(45) NOT NULL DEFAULT '0',
  `freecshipping` varchar(45) NOT NULL DEFAULT '0',
  `StartTime` varchar(45) NOT NULL DEFAULT '0',
  `EndTime` varchar(45) NOT NULL DEFAULT '0',
  `domshipping` varchar(45) NOT NULL DEFAULT '0',
  `domflatshipcost` varchar(45) NOT NULL DEFAULT '0',
  `domhandlingcost` decimal(19,2) NOT NULL DEFAULT '0.00',
  `maxuses` int unsigned NOT NULL DEFAULT '0',
  `currentuses` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`CouponID`)
) ENGINE=InnoDB AUTO_INCREMENT=204 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `CustomerID` int unsigned NOT NULL AUTO_INCREMENT,
  `firstname` varchar(45) NOT NULL DEFAULT '0',
  `lastname` varchar(45) NOT NULL DEFAULT '0',
  `address1` varchar(455) NOT NULL DEFAULT '0',
  `city` varchar(45) NOT NULL DEFAULT '0',
  `state` varchar(45) NOT NULL DEFAULT '0',
  `zip` varchar(45) NOT NULL DEFAULT '0',
  `country` varchar(45) NOT NULL DEFAULT '0',
  `shippingfirstname` varchar(45) NOT NULL DEFAULT '0',
  `shippinglastname` varchar(45) NOT NULL DEFAULT '0',
  `shippingaddress1` varchar(455) NOT NULL DEFAULT '0',
  `shippingcity` varchar(45) NOT NULL DEFAULT '0',
  `shippingstate` varchar(45) NOT NULL DEFAULT '0',
  `shippingzip` varchar(45) NOT NULL DEFAULT '0',
  `shippingcountry` varchar(45) NOT NULL DEFAULT '0',
  `phonenumber` varchar(45) NOT NULL DEFAULT '0',
  `email` varchar(45) NOT NULL DEFAULT '0',
  `password_a` varchar(64) NOT NULL DEFAULT '0',
  `password` varchar(64) DEFAULT NULL,
  `admin` varchar(45) NOT NULL DEFAULT '0',
  `bodyid` varchar(45) NOT NULL DEFAULT '0',
  `datecreated` varchar(455) NOT NULL DEFAULT '0',
  `address2` varchar(455) NOT NULL,
  `shippingaddress2` varchar(455) NOT NULL,
  `AddressType` varchar(45) NOT NULL DEFAULT '0',
  PRIMARY KEY (`CustomerID`)
) ENGINE=InnoDB AUTO_INCREMENT=76615 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `digitalAsset`
--

DROP TABLE IF EXISTS `digitalAsset`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `digitalAsset` (
  `asset_id` int unsigned NOT NULL AUTO_INCREMENT,
  `variant_id` int unsigned DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(1000) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `asset_type` enum('PRIMARY','GALLERY','THUMBNAIL') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`asset_id`),
  KEY `variant_id` (`variant_id`),
  CONSTRAINT `digitalAsset_ibfk_1` FOREIGN KEY (`variant_id`) REFERENCES `product_variant` (`variant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2268 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `grease`
--

DROP TABLE IF EXISTS `grease`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grease` (
  `GreaseID` int unsigned NOT NULL AUTO_INCREMENT,
  `GreaseName` varchar(45) NOT NULL DEFAULT '0',
  `GreasePrice` varchar(45) NOT NULL DEFAULT '0',
  PRIMARY KEY (`GreaseID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `hardware`
--

DROP TABLE IF EXISTS `hardware`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hardware` (
  `HardwareID` int unsigned NOT NULL AUTO_INCREMENT,
  `HardwareName` varchar(45) NOT NULL DEFAULT '0',
  `HardwarePrice` varchar(45) NOT NULL DEFAULT '0',
  PRIMARY KEY (`HardwareID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `invoice`
--

DROP TABLE IF EXISTS `invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice` (
  `InvoiceID` int unsigned NOT NULL AUTO_INCREMENT,
  `InvoiceNumber` varchar(45) NOT NULL DEFAULT '0',
  `ShippingMethod` varchar(45) NOT NULL DEFAULT '0',
  `CCType` varchar(45) NOT NULL DEFAULT '0',
  `CCNumber` varchar(9999) NOT NULL DEFAULT '0',
  `CCExp` varchar(45) NOT NULL DEFAULT '0',
  `CCID` varchar(45) NOT NULL DEFAULT '0',
  `ShippingTotal` varchar(45) NOT NULL DEFAULT '0',
  `PartsTotal` varchar(45) NOT NULL DEFAULT '0',
  `DateOrdered` varchar(45) NOT NULL DEFAULT '0',
  `DateEntered` varchar(45) NOT NULL DEFAULT '0',
  `CustomerID` varchar(45) NOT NULL DEFAULT '0',
  `TimeOrdered` varchar(45) NOT NULL DEFAULT '0',
  `CouponID` varchar(445) NOT NULL DEFAULT '0',
  `CouponDiscount` varchar(445) NOT NULL DEFAULT '0',
  `EnteredCustomerID` varchar(45) NOT NULL DEFAULT '0',
  `SalesTax` varchar(45) NOT NULL DEFAULT '0',
  `domhandling` varchar(45) NOT NULL DEFAULT '0',
  PRIMARY KEY (`InvoiceID`)
) ENGINE=InnoDB AUTO_INCREMENT=47810 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ipwhitelist`
--

DROP TABLE IF EXISTS `ipwhitelist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ipwhitelist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ip` varchar(50) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `count` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `links`
--

DROP TABLE IF EXISTS `links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `links` (
  `LinkID` int unsigned NOT NULL AUTO_INCREMENT,
  `LinkName` varchar(454) NOT NULL DEFAULT '0',
  `LinkDescription` varchar(445) NOT NULL DEFAULT '0',
  `LinkURL` varchar(445) NOT NULL DEFAULT '0',
  `LinkFollow` varchar(45) NOT NULL DEFAULT '0',
  PRIMARY KEY (`LinkID`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `maincategories`
--

DROP TABLE IF EXISTS `maincategories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maincategories` (
  `MainCatID` int unsigned NOT NULL AUTO_INCREMENT,
  `BodyID` varchar(45) NOT NULL DEFAULT '0',
  `MainCatImage` varchar(445) NOT NULL DEFAULT '0',
  `MainCatName` varchar(45) NOT NULL DEFAULT '0',
  PRIMARY KEY (`MainCatID`)
) ENGINE=InnoDB AUTO_INCREMENT=246 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mans`
--

DROP TABLE IF EXISTS `mans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mans` (
  `ManID` int unsigned NOT NULL AUTO_INCREMENT,
  `ManName` varchar(45) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ManID`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `menu_items`
--

DROP TABLE IF EXISTS `menu_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_items` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` int unsigned DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `href` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` int unsigned DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `menu_items_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=248 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `metatags`
--

DROP TABLE IF EXISTS `metatags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metatags` (
  `MetaTagID` int unsigned NOT NULL AUTO_INCREMENT,
  `Page` varchar(45) NOT NULL DEFAULT '0',
  `Title` varchar(455) NOT NULL DEFAULT '0',
  `Description` varchar(999) NOT NULL DEFAULT '0',
  `Keywords` varchar(800) NOT NULL DEFAULT '0',
  PRIMARY KEY (`MetaTagID`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `OrderID` int unsigned NOT NULL AUTO_INCREMENT,
  `InvoiceID` varchar(45) NOT NULL DEFAULT '0',
  `CustomerID` varchar(45) NOT NULL DEFAULT '0',
  `ProductID` varchar(45) NOT NULL DEFAULT '0',
  `Price` varchar(45) NOT NULL DEFAULT '0',
  `Qty` varchar(45) NOT NULL DEFAULT '0',
  `Color` varchar(45) NOT NULL DEFAULT '0',
  `Hardware` varchar(45) NOT NULL DEFAULT '0',
  `Grease` varchar(45) NOT NULL DEFAULT '0',
  `BodyID` varchar(45) NOT NULL DEFAULT '0',
  `Angle` varchar(45) NOT NULL DEFAULT '0',
  PRIMARY KEY (`OrderID`)
) ENGINE=InnoDB AUTO_INCREMENT=72518 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `platforms`
--

DROP TABLE IF EXISTS `platforms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platforms` (
  `PlatformID` int unsigned NOT NULL AUTO_INCREMENT,
  `Name` varchar(45) NOT NULL DEFAULT '0',
  `StartYear` varchar(45) NOT NULL DEFAULT '0',
  `EndYear` varchar(45) NOT NULL DEFAULT '0',
  `Image` varchar(445) NOT NULL DEFAULT '0',
  `PlatformOrder` int unsigned NOT NULL DEFAULT '0',
  `BodyCatID` int NOT NULL DEFAULT '0',
  `HeaderImage` varchar(455) NOT NULL DEFAULT '0',
  `slug` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`PlatformID`),
  KEY `idx_platforms_PlatformID` (`PlatformID`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pressrelease`
--

DROP TABLE IF EXISTS `pressrelease`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pressrelease` (
  `ReleaseID` int unsigned NOT NULL AUTO_INCREMENT,
  `PartNumber` varchar(45) NOT NULL DEFAULT '0',
  `ProductName` varchar(445) NOT NULL DEFAULT '0',
  `Description` varchar(9999) NOT NULL DEFAULT '0',
  `Price` varchar(45) NOT NULL DEFAULT '0',
  `BodyID` varchar(45) NOT NULL DEFAULT '0',
  `CatID` varchar(45) NOT NULL DEFAULT '0',
  `SmallImage` varchar(445) NOT NULL DEFAULT '0',
  `LargeImage` varchar(445) NOT NULL DEFAULT '0',
  `ReleaseFile` varchar(45) NOT NULL DEFAULT '0',
  `EnteredDate` varchar(45) NOT NULL DEFAULT '0',
  `StartAppYear` varchar(45) NOT NULL DEFAULT '0',
  `EndAppYear` varchar(45) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ReleaseID`)
) ENGINE=InnoDB AUTO_INCREMENT=455 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `product_attributes`
--

DROP TABLE IF EXISTS `product_attributes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_attributes` (
  `attribute_id` int unsigned NOT NULL AUTO_INCREMENT,
  `variant_id` int unsigned NOT NULL,
  `attribute_name` varchar(100) NOT NULL,
  `attribute_value` varchar(255) NOT NULL,
  PRIMARY KEY (`attribute_id`),
  KEY `variant_id` (`variant_id`),
  CONSTRAINT `product_attributes_ibfk_1` FOREIGN KEY (`variant_id`) REFERENCES `product_variant` (`variant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=686 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `product_details`
--

DROP TABLE IF EXISTS `product_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_details` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `maintenance_type` varchar(10) DEFAULT NULL,
  `hazardous_material_code` char(1) DEFAULT NULL,
  `gtin` varchar(14) DEFAULT NULL,
  `part_number` varchar(50) DEFAULT NULL,
  `brand_id` varchar(10) DEFAULT NULL,
  `brand_label` varchar(255) DEFAULT NULL,
  `aces_applications` char(1) DEFAULT NULL,
  `item_quantity_size` int DEFAULT NULL,
  `item_quantity_uom` varchar(10) DEFAULT NULL,
  `container_type` varchar(50) DEFAULT NULL,
  `quantity_per_application` int DEFAULT NULL,
  `quantity_uom` varchar(10) DEFAULT NULL,
  `min_order_quantity` int DEFAULT NULL,
  `part_terminology_id` int DEFAULT NULL,
  `description_short` text,
  `description_def` text,
  `description_detailed` text,
  `description_marketing` text,
  `description_invoice` text,
  `description_show` text,
  `price_jbr` decimal(10,2) DEFAULT NULL,
  `price_lst` decimal(10,2) DEFAULT NULL,
  `price_ret` decimal(10,2) DEFAULT NULL,
  `price_rmp` decimal(10,2) DEFAULT NULL,
  `currency_code` char(3) DEFAULT NULL,
  `country_of_origin` varchar(50) DEFAULT NULL,
  `extended_product_info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `product_attributes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `package_info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `digital_assets` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `product_variant`
--

DROP TABLE IF EXISTS `product_variant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variant` (
  `variant_id` int unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int unsigned NOT NULL,
  `part_number` varchar(100) NOT NULL,
  `color` enum('RED','BLACK_HAMMERTONE') NOT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`variant_id`),
  KEY `fk_product_variant_1_idx` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=250 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `ProductID` int unsigned NOT NULL AUTO_INCREMENT,
  `PartNumber` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `ProductName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `Description` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Retail` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '0',
  `Price` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '0',
  `ImageSmall` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `Qty` int unsigned NOT NULL DEFAULT '0',
  `BodyID` int unsigned NOT NULL DEFAULT '0',
  `PlatformID` int unsigned DEFAULT NULL,
  `CatID` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `ImageLarge` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `Features` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Instructions` varchar(555) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `Blength` int unsigned NOT NULL DEFAULT '0',
  `Bheight` int unsigned NOT NULL DEFAULT '0',
  `Bwidth` int unsigned NOT NULL DEFAULT '0',
  `Bweight` int unsigned NOT NULL DEFAULT '0',
  `Color` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `Hardware` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `Grease` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `Images` varchar(5555) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `NewPart` int unsigned NOT NULL DEFAULT '0',
  `NewPartDate` varchar(999) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `PackagePartnumbers` varchar(999) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `FreeShipping` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '0',
  `Display` int unsigned NOT NULL DEFAULT '0',
  `PackagePartnumbersQty` varchar(999) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `Package` int unsigned NOT NULL DEFAULT '0',
  `StartAppYear` varchar(999) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `EndAppYear` varchar(999) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `UsaMade` int unsigned NOT NULL DEFAULT '1',
  `fproduct` int unsigned NOT NULL DEFAULT '0',
  `CrossRef` varchar(999) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `ManID` int unsigned NOT NULL DEFAULT '0',
  `LowMargin` int unsigned NOT NULL DEFAULT '0',
  `mbox` varchar(455) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `flatrate` varchar(455) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `AngleFinder` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `endproduct` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `domhandling` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `hardwarepack` int unsigned NOT NULL DEFAULT '0',
  `hardwarepacks` varchar(455) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '0',
  `video` varchar(999) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `taxexempt` int unsigned NOT NULL DEFAULT '0',
  `couponexempt` int unsigned NOT NULL DEFAULT '0',
  `BlemProduct` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`ProductID`,`PartNumber`)
) ENGINE=InnoDB AUTO_INCREMENT=3123 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci CHECKSUM=1 COMMENT='InnoDB free: 101376 kB';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `searchbox`
--

DROP TABLE IF EXISTS `searchbox`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `searchbox` (
  `SearchBoxID` int unsigned NOT NULL AUTO_INCREMENT,
  `SearchDate` varchar(45) NOT NULL DEFAULT '0',
  `SearchField` varchar(455) NOT NULL DEFAULT '0',
  `CustomerID` varchar(45) NOT NULL DEFAULT '0',
  PRIMARY KEY (`SearchBoxID`)
) ENGINE=InnoDB AUTO_INCREMENT=562527 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicles` (
  `VehicleID` int unsigned NOT NULL AUTO_INCREMENT,
  `StartYear` varchar(45) NOT NULL DEFAULT '0',
  `EndYear` varchar(45) NOT NULL DEFAULT '0',
  `BodyID` varchar(45) NOT NULL DEFAULT '0',
  `Make` varchar(45) NOT NULL DEFAULT '0',
  `Model` varchar(45) NOT NULL DEFAULT '0',
  PRIMARY KEY (`VehicleID`)
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `videocats`
--

DROP TABLE IF EXISTS `videocats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `videocats` (
  `videocatid` int unsigned NOT NULL AUTO_INCREMENT,
  `videocatname` varchar(455) NOT NULL DEFAULT '0',
  `videocatimg` varchar(455) NOT NULL DEFAULT '0',
  `customercat` varchar(45) NOT NULL DEFAULT '0',
  PRIMARY KEY (`videocatid`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `videos`
--

DROP TABLE IF EXISTS `videos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `videos` (
  `videoid` int unsigned NOT NULL AUTO_INCREMENT,
  `videotitle` varchar(455) NOT NULL DEFAULT '0',
  `videodescription` varchar(999) NOT NULL DEFAULT '0',
  `videosrc` varchar(999) NOT NULL DEFAULT '0',
  `videocatid` varchar(45) NOT NULL DEFAULT '0',
  `videoimg` varchar(45) NOT NULL DEFAULT '0',
  `views` int NOT NULL DEFAULT '0',
  `videodate` varchar(45) NOT NULL DEFAULT '0',
  `fviews` int NOT NULL DEFAULT '0',
  `fvideo` varchar(45) NOT NULL DEFAULT '0',
  `youtube` varchar(45) NOT NULL DEFAULT '0',
  PRIMARY KEY (`videoid`)
) ENGINE=InnoDB AUTO_INCREMENT=185 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'bmrsuspension'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-04 15:57:42
