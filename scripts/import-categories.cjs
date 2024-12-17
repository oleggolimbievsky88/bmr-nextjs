const mysql = require('mysql2/promise');
const prisma = require('@prisma/client');

async function importCategories() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Amelia1',
      database: 'bmrsuspension'
    });

    const [categories] = await connection.execute('SELECT * FROM categories');
    await connection.end();

    for (const cat of categories) {
      await prisma.category.create({
        data: {
          id: cat.CatID,
          name: cat.CatName,
          slug: cat.CatName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          parentId: cat.ParentID > 0 ? cat.ParentID : null,
        }
      });
      console.log(`✓ Imported category: ${cat.CatName}`);
    }
  } catch (error) {
    console.error('Error importing categories:', error);
  }
}

importCategories().catch(console.error); 