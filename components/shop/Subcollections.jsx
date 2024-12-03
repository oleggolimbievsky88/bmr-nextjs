"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function Subcollections({ platformName }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category');

  // Fetch categories for this platform
  const categories = [/* fetch your categories here */];

  const handleCategoryClick = (categoryId) => {
    // Update URL with category filter
    const newUrl = categoryId 
      ? `/platform/${platformName}?category=${categoryId}`
      : `/platform/${platformName}`;
    router.push(newUrl);
  };

  return (
    <div className="category-filter">
      <div className="container">
        <div className="category-grid">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`category-item ${
                selectedCategory === category.id ? 'active' : ''
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
