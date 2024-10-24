// /pages/api/categories/route.js

import { getMainCategories } from '../../../lib/queries'; // Import your query function

export default async function handler(req, res) {
  try {
    const categories = await getMainCategories(); // Call the query function
    res.status(200).json(categories); // Return the categories as JSON
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: 'Failed to load categories.' });
  }
}
