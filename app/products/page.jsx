// For App Router: /app/products/page.js
'use client';
import { useEffect, useState } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from the API
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const data = await response.json();
        setProducts(data); // Store the products in state
      } catch (err) {
        setError(err.message); // Handle any errors
      } finally {
        setLoading(false); // Stop the loading state
      }
    }

    fetchProducts();
  }, []);

  if (loading) return <p>Loading...</p>; // Show loading state
  if (error) return <p>Error: {error}</p>; // Show error message

  return (
    <div>
      <h1>Products</h1>
      <ul>
        {products.map((product) => (
          <li key={product.ProductID}>
            <h2>{product.ProductName}</h2>
            <p>Price: ${product.price}</p>
            <p>{product.PartNumber}</p>
            <p>{product.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
