'use client';

// app/products/platform/[id]/page.js

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function PlatformProductsPage() {
  const [products, setProducts] = useState([]);
  const router = useRouter();
  const { id } = router.query; // Get platform ID from the URL

  useEffect(() => {
    if (!id) return; // Wait until the platform ID is available

    async function fetchProductsByPlatform() {
      const response = await fetch(`/api/products/platform/${id}`);
      const data = await response.json();
      setProducts(data);
    }

    fetchProductsByPlatform();
  }, [id]);

  return (
    <div>
      <h1>Products for Platform {id}</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <h2>{product.name}</h2>
            <p>Price: ${product.price}</p>
            <p>{product.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
