const mysql = require('mysql2/promise');

async function migrateCategories() {
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

    // Get all categories from old database
    const [categories] = await oldConnection.execute('SELECT * FROM categories');
    await oldConnection.end();

    // Connect to new database
    newConnection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Amelia1',
      database: 'bmr_db'
    });

    // First, import categories without parent relationships
    console.log('\nImporting categories (first pass)...');
    for (const cat of categories) {
      try {
        await newConnection.execute(
          `INSERT INTO categories (
            id, name, slug, parentId, attributes,
            created_at, updated_at
          ) VALUES (?, ?, ?, NULL, ?, NOW(), NOW())`,
          [
            cat.CatID,
            cat.CatName,
            cat.CatName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            JSON.stringify({
              oldImage: cat.CatImage || null,
              mainCatId: cat.MainCatID || null
            })
          ]
        );
        console.log(`✓ Created category: ${cat.CatName}`);
      } catch (error) {
        console.error(`✗ Failed to create category ${cat.CatName}:`, error.message);
      }
    }

    // Second pass - update parent relationships
    console.log('\nUpdating parent relationships...');
    for (const cat of categories) {
      if (cat.ParentID > 0) {
        try {
          await newConnection.execute(
            'UPDATE categories SET parentId = ? WHERE id = ?',
            [cat.ParentID, cat.CatID]
          );
          console.log(`✓ Updated parent for: ${cat.CatName}`);
        } catch (error) {
          console.error(`✗ Failed to update parent for ${cat.CatName}:`, error.message);
        }
      }
    }

    console.log('\n✓ Category migration completed successfully!');

  } catch (error) {
    console.error('\n✗ Migration failed:', error);
  } finally {
    if (oldConnection) await oldConnection.end();
    if (newConnection) await newConnection.end();
  }
}

migrateCategories().catch(console.error); 