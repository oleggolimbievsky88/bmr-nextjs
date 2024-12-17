-- MySQL dump 10.13  Distrib 8.4.3, for Linux (x86_64)
--
-- Host: localhost    Database: bmrsuspension
-- ------------------------------------------------------
-- Server version	8.4.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `anglefinder`
--It would be better if we could call it product add ons or something similar, so we don't have to have a table for Angle Finders and Grease and it should just point to the productId of the Grease or whatever product

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
-- This is for the homepage hero banner, if we could make this more efficient that would be best

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
-- This is for the homepage hero banner as well, if we could make combine the tables into one, maybe that would be better, but do what you think is best

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
-- Table structure for table `bodies` which needs to be platforms
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
  PRIMARY KEY (`BodyID`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bodycats` which needs to be platform categories
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
-- These are really product types or sub-categories, so maybe we rename this one as well

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `CatID` int unsigned NOT NULL AUTO_INCREMENT,
  `CatName` varchar(45) NOT NULL,
  `CatImage` varchar(45) NOT NULL DEFAULT '0',
  `MainCatID` varchar(45) NOT NULL DEFAULT '0',
  `ParentID` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`CatID`)
) ENGINE=InnoDB AUTO_INCREMENT=708 DEFAULT CHARSET=latin1;
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
) ENGINE=InnoDB AUTO_INCREMENT=14238 DEFAULT CHARSET=latin1;
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
) ENGINE=InnoDB AUTO_INCREMENT=178 DEFAULT CHARSET=latin1;
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
) ENGINE=InnoDB AUTO_INCREMENT=191 DEFAULT CHARSET=latin1;
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
) ENGINE=InnoDB AUTO_INCREMENT=63648 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

-- Table structure for table `grease`
-- Should be product add ons or something like that

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
) ENGINE=InnoDB AUTO_INCREMENT=44316 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `maincategories`
-- These are the platform categories

DROP TABLE IF EXISTS `maincategories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maincategories` (
  `MainCatID` int unsigned NOT NULL AUTO_INCREMENT,
  `BodyID` varchar(45) NOT NULL DEFAULT '0',
  `MainCatImage` varchar(445) NOT NULL DEFAULT '0',
  `MainCatName` varchar(45) NOT NULL DEFAULT '0',
  PRIMARY KEY (`MainCatID`)
) ENGINE=InnoDB AUTO_INCREMENT=221 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mans` should be called brands or Company
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
) ENGINE=InnoDB AUTO_INCREMENT=67297 DEFAULT CHARSET=latin1;
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
) ENGINE=InnoDB AUTO_INCREMENT=2979 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci CHECKSUM=1 COMMENT='InnoDB free: 101376 kB';
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
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;


/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-30  2:10:35
