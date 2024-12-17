const mysql = require('mysql2/promise');

async function migratePlatforms() {
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

    // Get platforms from old database
    const [platforms] = await oldConnection.execute('SELECT * FROM bodies');
    await oldConnection.end();

    // Connect to new database
    newConnection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Amelia1',
      database: 'bmr_db'
    });

    // Import platforms
    console.log('\nImporting platforms...');
    for (const platform of platforms) {
      try {
        // Check if category exists
        const categoryId = platform.BodyCatID ? parseInt(platform.BodyCatID) : null;
        if (categoryId) {
          const [categoryExists] = await newConnection.execute(
            'SELECT id FROM categories WHERE id = ?',
            [categoryId]
          );
          
          if (!categoryExists.length) {
            console.log(`⚠️ Skipping platform ${platform.Name}: Category ${categoryId} not found`);
            continue;
          }
        }

        await newConnection.execute(
          `INSERT INTO platforms (
            id, name, startYear, endYear, description, image, headerImage,
            \`order\`, categoryId, attributes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            platform.BodyID,
            platform.Name,
            parseInt(platform.StartYear) || 0,
            parseInt(platform.EndYear) || 0,
            platform.Description || null,
            platform.Image || null,
            platform.HeaderImage || null,
            platform.BodyOrder || 0,
            categoryId,
            JSON.stringify({}) // Empty attributes for now
          ]
        );
        console.log(`✓ Created platform: ${platform.Name}`);
      } catch (error) {
        console.error(`✗ Failed to create platform ${platform.Name}:`, error.message);
      }
    }

    console.log('\n✓ Platform migration completed successfully!');

  } catch (error) {
    console.error('\n✗ Migration failed:', error);
  } finally {
    if (newConnection) await newConnection.end();
  }
}

migratePlatforms().catch(console.error); 