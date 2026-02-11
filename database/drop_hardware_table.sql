-- Remove the legacy hardware table. Hardware packs are now regular products
-- (products.hardwarepack = 1) and are linked via products.hardwarepacks.
-- Run once; ignore if table does not exist.

DROP TABLE IF EXISTS hardware;
