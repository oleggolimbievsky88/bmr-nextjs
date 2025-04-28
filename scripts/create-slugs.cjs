// Script to generate slugs for all categories
async function generateSlugs() {
  // Get all main categories
  const mainCategories = await db.query(
    "SELECT MainCatID, MainCatName FROM maincategories"
  );

  // Update each main category with a slug
  for (const mainCat of mainCategories) {
    const slug = mainCat.MainCatName.toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
    await db.query("UPDATE maincategories SET slug = ? WHERE MainCatID = ?", [
      slug,
      mainCat.MainCatID,
    ]);
  }

  // Get all categories
  const categories = await db.query("SELECT CatID, CatName FROM categories");

  // Update each category with a slug
  for (const cat of categories) {
    const slug = cat.CatName.toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
    await db.query("UPDATE categories SET slug = ? WHERE CatID = ?", [
      slug,
      cat.CatID,
    ]);
  }

  console.log("All slugs generated successfully!");
}
