const mysql = require('mysql2/promise');
const xml2js = require('xml2js');
const fs = require('fs').promises;
const config = require('./config.cjs');

async function importPIES() {
  let connection;
  try {
    // Read and parse XML file
    const xmlData = await fs.readFile('data/pies.xml', 'utf8');
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xmlData);
    
    // Connect to database
    connection = await mysql.createConnection(config.db);

    // Process each item
    for (const item of result.PIES.Items.Item) {
      try {
        // 1. Create or update base product
        const [product] = await connection.execute(
          `INSERT INTO products (
            partNumber, name, gtin, brand, hazardous,
            quantitySize, quantityUOM, minOrderQty,
            description, features, instructions,
            isActive, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW())
          ON DUPLICATE KEY UPDATE
            gtin = VALUES(gtin),
            brand = VALUES(brand),
            updated_at = NOW()`,
          [
            item.PartNumber,
            item.Descriptions.Description.find(d => d.$.DescriptionCode === 'DES')?._,
            item.ItemLevelGTIN?._,
            item.BrandLabel,
            item.HazardousMaterialCode === 'Y',
            parseInt(item.ItemQuantitySize?._) || 1,
            item.ItemQuantitySize?.$.UOM,
            parseInt(item.MinimumOrderQuantity?._) || 1,
            item.Descriptions.Description.find(d => d.$.DescriptionCode === 'MKT')?._,
            item.Descriptions.Description.find(d => d.$.DescriptionCode === 'ASC')?._,
            null // Instructions will be handled separately
          ]
        );

        const productId = product.insertId;

        // 2. Import product attributes
        if (item.ProductAttributes?.ProductAttribute) {
          const attributes = Array.isArray(item.ProductAttributes.ProductAttribute) 
            ? item.ProductAttributes.ProductAttribute 
            : [item.ProductAttributes.ProductAttribute];

          for (const attr of attributes) {
            await connection.execute(
              `INSERT INTO product_attributes (
                productId, name, value, isPADB,
                created_at, updated_at
              ) VALUES (?, ?, ?, ?, NOW(), NOW())
              ON DUPLICATE KEY UPDATE
                value = VALUES(value),
                updated_at = NOW()`,
              [
                productId,
                attr.$.AttributeID,
                attr._,
                attr.$.PADBAttribute === 'Y'
              ]
            );
          }
        }

        // 3. Import digital assets
        if (item.DigitalAssets?.DigitalFileInformation) {
          const assets = Array.isArray(item.DigitalAssets.DigitalFileInformation)
            ? item.DigitalAssets.DigitalFileInformation
            : [item.DigitalAssets.DigitalFileInformation];

          for (const asset of assets) {
            await connection.execute(
              `INSERT INTO digital_assets (
                productId, fileName, assetType, fileType,
                created_at, updated_at
              ) VALUES (?, ?, ?, ?, NOW(), NOW())`,
              [
                productId,
                asset.FileName,
                asset.AssetType,
                asset.FileType
              ]
            );
          }
        }

        // 4. Import prices
        if (item.Prices?.Pricing) {
          const prices = Array.isArray(item.Prices.Pricing)
            ? item.Prices.Pricing
            : [item.Prices.Pricing];

          for (const price of prices) {
            await connection.execute(
              `INSERT INTO product_prices (
                productId, priceType, amount, currency,
                created_at, updated_at
              ) VALUES (?, ?, ?, ?, NOW(), NOW())
              ON DUPLICATE KEY UPDATE
                amount = VALUES(amount),
                updated_at = NOW()`,
              [
                productId,
                price.$.PriceType,
                parseFloat(price.Price._),
                price.CurrencyCode
              ]
            );
          }
        }

        console.log(`✓ Imported product: ${item.PartNumber}`);
      } catch (error) {
        console.error(`✗ Failed to import product ${item.PartNumber}:`, error.message);
      }
    }

    console.log('\n✓ PIES import completed successfully!');

  } catch (error) {
    console.error('\n✗ Import failed:', error);
  } finally {
    if (connection) await connection.end();
  }
}

importPIES().catch(console.error); 