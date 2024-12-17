const mysql = require('mysql2/promise');

async function checkSchema() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Amelia1',
      database: 'bmr_db'
    });

    const [columns] = await connection.execute('DESCRIBE categories');
    console.log('\nCategories table schema:');
    columns.forEach(col => {
      console.log(`${col.Field}: ${col.Type}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

checkSchema().catch(console.error); 