const mysql = require('mysql2/promise');

async function checkCategories() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Amelia1',
      database: 'bmrsuspension'
    });

    const [products] = await connection.execute('SELECT DISTINCT CatID, ProductName FROM products');
    const [categories] = await connection.execute('SELECT CatID FROM categories');

    const existingCatIds = new Set(categories.map(c => c.CatID));
    const missingCategories = products.filter(p => !existingCatIds.has(p.CatID));

    console.log('\nMissing Categories:');
    missingCategories.forEach(p => {
      console.log(`Category ID ${p.CatID} used by product: ${p.ProductName}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

checkCategories().catch(console.error); 