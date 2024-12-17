const mysql = require('mysql2/promise');

async function createCoreCategories() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Amelia1',
      database: 'bmr_db'
    });

    // Core categories needed for platforms
    const coreCategories = [
      { id: 1, name: 'GM Vehicles', slug: 'gm-vehicles' },
      { id: 2, name: 'Classic Cars', slug: 'classic-cars' },
      { id: 3, name: 'Classic GM', slug: 'classic-gm' },
      { id: 4, name: 'Ford Vehicles', slug: 'ford-vehicles' },
      { id: 5, name: 'Dodge Vehicles', slug: 'dodge-vehicles' },
      { id: 6, name: 'Gift Cards', slug: 'gift-cards' },
      { id: 10, name: 'Miscellaneous', slug: 'miscellaneous' },
      { id: 11, name: 'Apparel', slug: 'apparel' }
    ];

    console.log('\nCreating core categories...');
    for (const cat of coreCategories) {
      try {
        await connection.execute(
          `INSERT INTO categories (
            id, name, slug, description, parentId, attributes,
            created_at, updated_at
          ) VALUES (?, ?, ?, NULL, NULL, ?, NOW(), NOW())`,
          [
            cat.id,
            cat.name,
            cat.slug,
            JSON.stringify({})
          ]
        );
        console.log(`✓ Created category: ${cat.name}`);
      } catch (error) {
        console.error(`✗ Failed to create category ${cat.name}:`, error.message);
      }
    }

    console.log('\n✓ Core categories created successfully!');

  } catch (error) {
    console.error('\n✗ Failed:', error);
  } finally {
    if (connection) await connection.end();
  }
}

createCoreCategories().catch(console.error); 