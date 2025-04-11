import mysql from "mysql2/promise";

// Direct database connection for the menu
export async function getDirectMenuData() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || process.env.DB_HOST || "131.153.149.105",
    user: process.env.MYSQL_USER || process.env.DB_USER || "nextjsapi",
    password:
      process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || "DeepVase2024!",
    database:
      process.env.MYSQL_DATABASE || process.env.DB_NAME || "bmrsuspension",
  });

  try {
    // Get all bodies grouped by body category
    const query = `
      SELECT b.BodyID, b.Name, b.StartYear, b.EndYear, b.BodyOrder,
             bc.BodyCatID, bc.BodyCatName, bc.Position
      FROM bodies b
      JOIN bodycats bc ON b.BodyCatID = bc.BodyCatID
      ORDER BY bc.Position, b.BodyOrder
    `;

    const [bodies] = await connection.query(query);

    // Group by categories
    const fordBodies = bodies.filter((body) =>
      body.BodyCatName.includes("Ford")
    );
    const gmLateBodies = bodies.filter((body) =>
      body.BodyCatName.includes("GM Late Model")
    );
    const gmMidMuscle = bodies.filter((body) =>
      body.BodyCatName.includes("GM Mid Muscle")
    );
    const gmClassicMuscle = bodies.filter((body) =>
      body.BodyCatName.includes("GM Classic Muscle")
    );
    const moparBodies = bodies.filter((body) =>
      body.BodyCatName.includes("Mopar")
    );

    // Create the menu data structure
    const menuData = {
      fordLinks: fordBodies.map((body) => ({
        heading: `${body.StartYear} - ${body.EndYear} ${body.Name}`,
        slug: `${body.Name.toLowerCase().replace(/\s+/g, "-")}-${
          body.StartYear
        }-${body.EndYear}`,
        bodyId: body.BodyID,
        links: [],
      })),

      gmLateModelLinks: gmLateBodies.map((body) => ({
        heading: `${body.StartYear} - ${body.EndYear} ${body.Name}`,
        slug: `${body.Name.toLowerCase().replace(/\s+/g, "-")}-${
          body.StartYear
        }-${body.EndYear}`,
        bodyId: body.BodyID,
        links: [],
      })),

      gmMidMuscleLinks: gmMidMuscle.map((body) => ({
        heading: `${body.StartYear} - ${body.EndYear} ${body.Name}`,
        slug: `${body.Name.toLowerCase().replace(/\s+/g, "-")}-${
          body.StartYear
        }-${body.EndYear}`,
        bodyId: body.BodyID,
        links: [],
      })),

      gmClassicMuscleLinks: gmClassicMuscle.map((body) => ({
        heading: `${body.StartYear} - ${body.EndYear} ${body.Name}`,
        slug: `${body.Name.toLowerCase().replace(/\s+/g, "-")}-${
          body.StartYear
        }-${body.EndYear}`,
        bodyId: body.BodyID,
        links: [],
      })),

      moparLinks: moparBodies.map((body) => ({
        heading: `${body.StartYear} - ${body.EndYear} ${body.Name}`,
        slug: `${body.Name.toLowerCase().replace(/\s+/g, "-")}-${
          body.StartYear
        }-${body.EndYear}`,
        bodyId: body.BodyID,
        links: [],
      })),
    };

    // For each body, get its main categories
    const categories = [
      "Suspension",
      "Chassis",
      "Bushing Kits",
      "Safety Equipment",
    ];

    // Add sample links to each body
    Object.keys(menuData).forEach((key) => {
      menuData[key].forEach((item) => {
        // Add simulated links for testing until we have the real links
        item.links = categories.flatMap((cat) => [
          {
            text: `${cat} Overview`,
            href: `/products/${item.slug}/${cat
              .toLowerCase()
              .replace(/\s+/g, "-")}`,
          },
          {
            text: `${cat} Kits`,
            href: `/products/${item.slug}/${cat
              .toLowerCase()
              .replace(/\s+/g, "-")}/kits`,
          },
        ]);
      });
    });

    return menuData;
  } catch (error) {
    console.error("Failed to fetch direct menu data:", error);
    return {
      fordLinks: [],
      gmLateModelLinks: [],
      gmMidMuscleLinks: [],
      gmClassicMuscleLinks: [],
      moparLinks: [],
    };
  } finally {
    await connection.end();
  }
}
