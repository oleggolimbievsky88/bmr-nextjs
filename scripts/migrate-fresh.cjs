const mysql = require('mysql2/promise');

async function migrateFresh() {
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
    const [categories] = await oldConnection.execute('SELECT * FROM categories');
    await oldConnection.end();

    // Connect to new database
    newConnection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Amelia1',
      database: 'bmr_db'
    });

    // Import root categories first
    console.log('\nImporting root categories...');
    for (const cat of categories.filter(c => !c.ParentID || c.ParentID === 0)) {
      try {
        await newConnection.execute(
          `INSERT INTO categories (
            id, name, slug, description, parentId, attributes,
            created_at, updated_at
          ) VALUES (?, ?, ?, NULL, NULL, ?, NOW(), NOW())`,
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
        console.log(`✓ Created root category: ${cat.CatName}`);
      } catch (error) {
        console.error(`✗ Failed to create root category ${cat.CatName}:`, error.message);
      }
    }

    // Then import child categories
    console.log('\nImporting child categories...');
    for (const cat of categories.filter(c => c.ParentID > 0)) {
      try {
        await newConnection.execute(
          `INSERT INTO categories (
            id, name, slug, description, parentId, attributes,
            created_at, updated_at
          ) VALUES (?, ?, ?, NULL, ?, ?, NOW(), NOW())`,
          [
            cat.CatID,
            cat.CatName,
            cat.CatName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            cat.ParentID,
            JSON.stringify({
              oldImage: cat.CatImage || null,
              mainCatId: cat.MainCatID || null
            })
          ]
        );
        console.log(`✓ Created child category: ${cat.CatName} (parent: ${cat.ParentID})`);
      } catch (error) {
        console.error(`✗ Failed to create child category ${cat.CatName}:`, error.message);
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

migrateFresh().catch(console.error); 