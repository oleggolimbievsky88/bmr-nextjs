// import { getMainCategories, getCategoriesByCatId } from "../../../lib/queries";

// // Handle GET requests
// export async function GET(req) {
//   try {
//     // Fetch all main categories
//     const mainCategories = await getMainCategories();

//     // For each main category, fetch its subcategories
//     const menu = await Promise.all(
//       mainCategories.map(async (mainCategory) => {
//         const subCategories = await getCategoriesByCatId(mainCategory.MainCatID);
//         return {
//           heading: mainCategory.MainCatName,
//           links: subCategories.map((sub) => ({
//             href: `/platform/${sub.CatName.replace(/\s+/g, '-').toLowerCase()}`,
//             text: sub.CatName,
//           })),
//         };
//       })
//     );

//     return new Response(JSON.stringify(menu), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     return new Response(JSON.stringify({ error: "Failed to fetch menu data." }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }
