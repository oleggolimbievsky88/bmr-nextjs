import Image from 'next/image';
import Link from 'next/link';

export default function ProductGrid({ products }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8">
        No products found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product.ProductID} className="product-card bg-white rounded-lg shadow-md overflow-hidden">
          <Link href={`/product/${product.ProductID}`}>
            <div className="relative h-48 w-full">
              <Image
                src={product.ImageSmall ? `/images/products/${product.ImageSmall}` : '/images/placeholder.jpg'}
                alt={product.ProductName}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                {product.ProductName}
              </h3>
              <p className="text-gray-600 mb-2 line-clamp-2">
                {product.Description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">
                  ${parseFloat(product.Price).toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">
                  Part #: {product.PartNumber}
                </span>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
} 