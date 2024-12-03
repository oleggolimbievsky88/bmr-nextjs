'use client';

import { useEffect, useState } from 'react';

export default function CategoryContent({ initialProducts, initialCategories, platformName, categorySlug }) {
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products for this category
        const productsResponse = await fetch(`/api/platform/${platformName}/${categorySlug}`);
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products');
        }
        const productsData = await productsResponse.json();
        setProducts(productsData);

        // Fetch category details
        const categoryResponse = await fetch(`/api/category/${categorySlug}`);
        if (!categoryResponse.ok) {
          throw new Error('Failed to fetch category details');
        }
        const categoryData = await categoryResponse.json();
        setCategories(categoryData);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {categories && categories.map((category) => (
        <div key={category.CatID} className="category-item">
          <h3>{category.CatName}</h3>
          {category.MainCatImage && category.MainCatImage !== '0' && (
            <img src={category.MainCatImage} alt={category.CatName} />
          )}
          <p>{category.CatDescription}</p>
        </div>
      ))}
    </div>
  );
      {/* Products Grid */}
      <div className="products-grid mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {products && products.map((product) => (
          <div key={product.PartID} className="product-card border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="aspect-square relative mb-4">
              {product.MainImage ? (
                <img 
                  src={product.MainImage} 
                  alt={product.PartNumber}
                  className="object-cover w-full h-full rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>
            <div className="product-details">
              <h4 className="font-medium text-lg mb-2">{product.PartNumber}</h4>
              <p className="text-gray-600 mb-2">{product.Description}</p>
              <p className="text-lg font-bold text-blue-600">
                ${product.Price ? product.Price.toFixed(2) : 'Price not available'}
              </p>
            </div>
          </div>
        ))}
        {(!products || products.length === 0) && (
          <div className="col-span-full text-center py-8">
            No products found in this category
          </div>
        )}
      </div>
} 