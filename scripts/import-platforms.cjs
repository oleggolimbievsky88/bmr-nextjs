const mysql = require('mysql2/promise');
const prisma = require('@prisma/client');

async function importPlatforms() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Amelia1',
      database: 'bmrsuspension_new'
    });

    const [platforms] = await connection.execute('SELECT * FROM bodies');
    await connection.end();

    for (const platform of platforms) {
      const categoryId = platform.BodyCatID ? parseInt(platform.BodyCatID) : null;
      if (categoryId) {
        const categoryExists = await prisma.category.findUnique({
          where: { id: categoryId }
        });

        if (!categoryExists) {
          console.log(`⚠️ Skipping platform ${platform.Name}: Category ${categoryId} not found`);
          continue;
        }
      }

      await prisma.platform.create({
        data: {
          id: platform.BodyID,
          name: platform.Name,
          startYear: parseInt(platform.StartYear) || 0,
          endYear: parseInt(platform.EndYear) || 0,
          image: platform.Image || null,
          headerImage: platform.HeaderImage || null,
          order: platform.BodyOrder || 0,
          categoryId: categoryId,
        }
      });
      console.log(`✓ Imported platform: ${platform.Name}`);
    }
  } catch (error) {
    console.error('Error importing platforms:', error);
  }
}

importPlatforms().catch(console.error); 