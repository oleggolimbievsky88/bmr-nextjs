"use client";
import { useSearchParams } from 'next/navigation';

export default function ShopDefault({ platformName }) {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category');

  // Fetch products based on platform and category
  const products = [/* fetch your products here */];

  // Filter products if category is selected
  const filteredProducts = selectedCategory
    ? products.filter(product => product.categoryId === selectedCategory)
    : products;

  return (
    <div className="shop-products">
      <div className="container">
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              {/* Your product card content */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
