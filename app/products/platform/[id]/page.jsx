'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Example: Mock product data (replace with actual API call or fetch from database)
const mockProducts = [
  { id: 1, name: 'Suspension Kit', platform: '2024-mustang' },
  { id: 2, name: 'Chassis Reinforcement', platform: '2024-mustang' },
  { id: 3, name: 'Bushing Kit', platform: '2005-2014-mustang' },
];

const PlatformPage = () => {
  const router = useRouter();
  const { platform } = router.query;
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    // Filter products based on the platform from the query
    if (platform) {
      const filtered = mockProducts.filter(
        (product) => product.platform === platform
      );
      setFilteredProducts(filtered);
    }
  }, [platform]);

  if (!platform) return <p>Loading...</p>;

  return (
    <div>
      <h1>Products for {platform.replace('-', ' ')}</h1>
      <ul>
        {filteredProducts.map((product) => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default PlatformPage;
