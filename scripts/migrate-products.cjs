const mysql = require('mysql2/promise');

async function migrateProducts() {
  let oldConnection;
  let newConnection;
  try {
    // Connect to old database
    oldConnection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Amelia1',
      database: 'bmrsuspension'
    });

    // Get all data first
    console.log('Fetching data from old database...');
    const [platforms] = await oldConnection.execute('SELECT * FROM bodies ORDER BY BodyOrder');
    const [products] = await oldConnection.execute('SELECT * FROM products WHERE Display = 1');
    await oldConnection.end();

    // Connect to new database
    newConnection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Amelia1',
      database: 'bmr_db'
    });

    // Import platforms first
    console.log('\nImporting platforms...');
    for (const platform of platforms) {
      try {
        await newConnection.execute(
          `INSERT INTO platforms (
            id, name, start_year, end_year, image, header_image,
            \`order\`, category_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            platform.BodyID,
            platform.Name,
            parseInt(platform.StartYear) || 0,
            parseInt(platform.EndYear) || 0,
            platform.Image || null,
            platform.HeaderImage || null,
            platform.BodyOrder || 0,
            platform.BodyCatID ? parseInt(platform.BodyCatID) : null
          ]
        );
        console.log(`✓ Created platform: ${platform.Name}`);
      } catch (error) {
        console.error(`✗ Failed to create platform ${platform.Name}:`, error.message);
      }
    }

    // Import products
    console.log('\nImporting products...');
    for (const product of products) {
      try {
        // Check if platform exists when product has a platform ID
        const platformId = product.BodyID || null;
        if (platformId) {
          const [platformExists] = await newConnection.execute(
            'SELECT id FROM platforms WHERE id = ?',
            [platformId]
          );
          
          if (!platformExists.length) {
            console.log(`⚠️ Skipping product ${product.ProductName}: Platform ${platformId} not found`);
            continue;
          }
        }

        await newConnection.execute(
          `INSERT INTO products (
            id, part_number, name, description_short, description_long,
            features, instructions, category_id, platform_id,
            is_new, is_active, is_blem, attributes,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            product.ProductID,
            product.PartNumber,
            product.ProductName,
            product.Description || null,
            product.Features || null,
            product.Features || null,
            product.Instructions || null,
            parseInt(product.CatID) || null,
            platformId,
            Boolean(product.NewPart),
            Boolean(product.Display),
            Boolean(product.BlemProduct),
            JSON.stringify({
              oldData: {
                imageSmall: product.ImageSmall || null,
                imageLarge: product.ImageLarge || null,
                images: product.Images || null,
                newPartDate: product.NewPartDate || null,
                manufacturerId: product.ManID || null
              }
            })
          ]
        );
        console.log(`✓ Created product: ${product.ProductName}`);
      } catch (error) {
        console.error(`✗ Failed to create product ${product.ProductName}:`, error.message);
      }
    }

    console.log('\n✓ Migration completed successfully!');

  } catch (error) {
    console.error('\n✗ Migration failed:', error);
  } finally {
    if (oldConnection) await oldConnection.end();
    if (newConnection) await newConnection.end();
  }
}

migrateProducts().catch(console.error); 