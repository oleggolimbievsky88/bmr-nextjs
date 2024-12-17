const mysql = require('mysql2/promise');

async function checkOldCategories() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Amelia1',
      database: 'bmrsuspension'
    });

    const [categories] = await connection.execute('SELECT * FROM categories');
    
    console.log('\nCategories in old database:');
    categories.forEach(cat => {
      console.log(`ID: ${cat.CatID}, Name: ${cat.CatName}, ParentID: ${cat.ParentID}`);
    });

    console.log(`\nTotal categories: ${categories.length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

checkOldCategories().catch(console.error); 