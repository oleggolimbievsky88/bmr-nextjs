const mysql = require('mysql2/promise');

async function checkPlatformsFull() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Amelia1',
      database: 'bmrsuspension'
    });

    const [platforms] = await connection.execute('SELECT * FROM bodies');
    console.log('\nFull platform data from old database:');
    platforms.forEach(p => {
      console.log(`
Platform: ${p.Name}
  ID: ${p.BodyID}
  Start Year: ${p.StartYear || 'N/A'}
  End Year: ${p.EndYear || 'N/A'}
  Image: ${p.Image || 'N/A'}
  Header Image: ${p.HeaderImage || 'N/A'}
  Order: ${p.BodyOrder || 'N/A'}
  Category ID: ${p.BodyCatID || 'N/A'}
  Description: ${p.Description || 'N/A'}
-------------------`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

checkPlatformsFull().catch(console.error); 