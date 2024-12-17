const { PrismaClient } = require('@prisma/client');
const mysql = require('mysql2/promise');

let prisma;
let connection;

async function main() {
  try {
    // Initialize connections
    prisma = new PrismaClient();
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Amelia1',
      database: 'bmrsuspension'
    });

    console.log('Starting migration...');

    // 1. Migrate Categories
    console.log('Migrating categories...');
    const [categories] = await connection.execute(
      'SELECT * FROM categories'
    );
    
    for (const cat of categories) {
      try {
        await prisma.category.create({
          data: {
            id: cat.CatID,
            name: cat.CatName,
            slug: cat.CatName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            parentId: cat.ParentID > 0 ? cat.ParentID : null,
            attributes: {
              oldImage: cat.CatImage || null,
              mainCatId: cat.MainCatID || null
            }
          }
        });
        console.log(`✓ Migrated category: ${cat.CatName}`);
      } catch (error) {
        console.error(`✗ Failed to migrate category ${cat.CatName}:`, error.message);
      }
    }

    // 2. Migrate Platforms (bodies)
    console.log('\nMigrating platforms...');
    const [platforms] = await connection.execute(
      'SELECT * FROM bodies ORDER BY BodyOrder'
    );

    for (const platform of platforms) {
      try {
        await prisma.platform.create({
          data: {
            id: platform.BodyID,
            name: platform.Name,
            startYear: parseInt(platform.StartYear) || 0,
            endYear: parseInt(platform.EndYear) || 0,
            image: platform.Image || null,
            headerImage: platform.HeaderImage || null,
            order: platform.BodyOrder || 0,
            categoryId: platform.BodyCatID ? parseInt(platform.BodyCatID) : null
          }
        });
        console.log(`✓ Migrated platform: ${platform.Name}`);
      } catch (error) {
        console.error(`✗ Failed to migrate platform ${platform.Name}:`, error.message);
      }
    }

    // 3. Migrate Products
    console.log('\nMigrating products...');
    const [products] = await connection.execute(
      'SELECT * FROM products WHERE Display = 1'
    );

    for (const product of products) {
      try {
        // Create base product
        const newProduct = await prisma.product.create({
          data: {
            id: product.ProductID,
            partNumber: product.PartNumber,
            name: product.ProductName,
            descriptionShort: product.Description || null,
            descriptionLong: product.Features || null,
            features: product.Features || null,
            instructions: product.Instructions || null,
            categoryId: parseInt(product.CatID) || null,
            platformId: product.BodyID || null,
            isNew: Boolean(product.NewPart),
            isActive: Boolean(product.Display),
            isBlem: Boolean(product.BlemProduct),
            attributes: {
              oldData: {
                imageSmall: product.ImageSmall || null,
                imageLarge: product.ImageLarge || null,
                images: product.Images || null,
                newPartDate: product.NewPartDate || null,
                manufacturerId: product.ManID || null
              }
            }
          }
        });

        // Create product variant
        await prisma.productVariant.create({
          data: {
            productId: newProduct.id,
            sku: product.PartNumber,
            price: parseFloat(product.Price) || 0,
            color: product.Color || null,
            weight: product.Bweight ? parseFloat(product.Bweight) : null,
            length: product.Blength ? parseFloat(product.Blength) : null,
            width: product.Bwidth ? parseFloat(product.Bwidth) : null,
            height: product.Bheight ? parseFloat(product.Bheight) : null,
            stockQuantity: parseInt(product.Qty) || 0
          }
        });

        // Handle images
        if (product.ImageLarge) {
          await prisma.image.create({
            data: {
              url: product.ImageLarge,
              productId: newProduct.id,
              sortOrder: 0,
              altText: `Main image for ${product.ProductName}`
            }
          });
        }

        // Handle additional images
        if (product.Images) {
          const additionalImages = product.Images.split(/[,;]/)
            .map(img => img.trim())
            .filter(img => img && img !== '0');

          for (const [index, imgUrl] of additionalImages.entries()) {
            await prisma.image.create({
              data: {
                url: imgUrl,
                productId: newProduct.id,
                sortOrder: index + 1,
                altText: `Additional image ${index + 1} for ${product.ProductName}`
              }
            });
          }
        }

        console.log(`✓ Migrated product: ${product.ProductName}`);
      } catch (error) {
        console.error(`✗ Failed to migrate product ${product.ProductName}:`, error.message);
      }
    }

    // 4. Migrate Vehicles
    console.log('\nMigrating vehicles...');
    const [vehicles] = await connection.execute(
      'SELECT * FROM vehicles'
    );

    for (const vehicle of vehicles) {
      try {
        await prisma.vehicle.create({
          data: {
            platformId: parseInt(vehicle.BodyID),
            year: parseInt(vehicle.StartYear) || 0,
            make: vehicle.Make,
            model: vehicle.Model
          }
        });
        console.log(`✓ Migrated vehicle: ${vehicle.Make} ${vehicle.Model} ${vehicle.StartYear}`);
      } catch (error) {
        console.error(`✗ Failed to migrate vehicle ${vehicle.Make} ${vehicle.Model}:`, error.message);
      }
    }

    console.log('\n✓ Migration completed successfully!');

  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
    throw error;
  } finally {
    if (prisma) await prisma.$disconnect();
    if (connection) await connection.end();
  }
}

// Run the migration
main().catch(console.error); 