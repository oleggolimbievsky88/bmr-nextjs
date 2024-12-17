const mysql = require('mysql2/promise');

async function checkNewCategories() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Amelia1',
      database: 'bmr_db'
    });

    const [categories] = await connection.execute('SELECT * FROM categories');
    console.log(`\nCategories in new database: ${categories.length}`);

    if (categories.length === 0) {
      console.log('Categories table is empty!');
    } else {
      categories.forEach(cat => {
        console.log(`ID: ${cat.id}, Name: ${cat.name}, ParentID: ${cat.parent_id}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

checkNewCategories().catch(console.error); 