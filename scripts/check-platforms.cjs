const mysql = require('mysql2/promise');

async function checkPlatforms() {
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
    const [oldPlatforms] = await oldConnection.execute('SELECT * FROM bodies');
    console.log('\nPlatforms in old database:', oldPlatforms.length);
    oldPlatforms.forEach(p => {
      console.log(`ID: ${p.BodyID}, Name: ${p.Name}`);
    });

    // Connect to new database
    newConnection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Amelia1',
      database: 'bmr_db'
    });

    // Check schema
    const [columns] = await newConnection.execute('DESCRIBE platforms');
    console.log('\nPlatforms table schema:');
    columns.forEach(col => {
      console.log(`${col.Field}: ${col.Type}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (oldConnection) await oldConnection.end();
    if (newConnection) await newConnection.end();
  }
}

checkPlatforms().catch(console.error); 