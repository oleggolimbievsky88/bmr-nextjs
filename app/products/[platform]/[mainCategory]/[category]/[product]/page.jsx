import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { db } from "@/lib/db";

// This enables dynamic rendering for this route
export const dynamic = "force-dynamic";

async function getProductData(productSlug, platform, mainCategory, category) {
  try {
    // Get platform ID
    const platformQuery = `
      SELECT BodyID
      FROM bodies
      WHERE Name LIKE ?
      LIMIT 1
    `;

    const platformData = await db.queryOne(platformQuery, [`%${platform}%`]);

    if (!platformData) {
      return null;
    }

    // Get category ID
    const categoryQuery = `
      SELECT CatID
      FROM categories
      WHERE CatName LIKE ?
      LIMIT 1
    `;

    const categoryData = await db.queryOne(categoryQuery, [
      `%${category.replace(/-/g, " ")}%`,
    ]);

    if (!categoryData) {
      return null;
    }

    // Get product by slug and category
    const productQuery = `
      SELECT
        p.ProductID,
        p.ProductName,
        p.PartNumber,
        p.Description,
        p.Features,
        p.Price,
        p.Retail,
        p.ImageSmall,
        p.ImageLarge,
        p.Images,
        p.Instructions,
        p.Color,
        p.Hardware,
        p.Grease,
        p.AngleFinder,
        p.video
      FROM products p
      WHERE p.BodyID = ?
        AND FIND_IN_SET(?, p.CatID)
        AND p.ProductName LIKE ?
      LIMIT 1
    `;

    const productData = await db.queryOne(productQuery, [
      platformData.BodyID,
      categoryData.CatID,
      `%${productSlug.replace(/-/g, " ")}%`,
    ]);

    if (!productData) {
      return null;
    }

    // Get related products
    const relatedProductsQuery = `
      SELECT
        p.ProductID,
        p.ProductName,
        p.PartNumber,
        p.Price,
        p.ImageSmall
      FROM products p
      WHERE p.BodyID = ?
        AND FIND_IN_SET(?, p.CatID)
        AND p.ProductID != ?
      LIMIT 4
    `;

    const relatedProducts = await db.query(relatedProductsQuery, [
      platformData.BodyID,
      categoryData.CatID,
      productData.ProductID,
    ]);

    return {
      product: productData,
      relatedProducts,
    };
  } catch (error) {
    console.error("Error fetching product data:", error);
    return null;
  }
}

export default async function ProductDetailPage({ params }) {
  const { platform, mainCategory, category, product: productSlug } = params;

  // Get product data
  const data = await getProductData(
    productSlug,
    platform,
    mainCategory,
    category
  );

  if (!data) {
    notFound();
  }

  const { product, relatedProducts } = data;

  // Parse product images
  const productImages = product.Images
    ? product.Images.split(",").filter((img) => img && img !== "0")
    : [];

  if (product.ImageLarge && product.ImageLarge !== "0") {
    productImages.unshift(product.ImageLarge);
  } else if (product.ImageSmall && product.ImageSmall !== "0") {
    productImages.unshift(product.ImageSmall);
  }

  // Parse product features as list items
  const features = product.Features
    ? product.Features.split("\n").filter((item) => item.trim())
    : [];

  return (
    <div className="shop-details">
      <div className="container">
        {/* Breadcrumb */}
        <Breadcrumbs />

        {/* Product Details */}
        <div className="product-details-top">
          <div className="row">
            {/* Product Gallery */}
            <div className="col-md-6">
              <div className="product-gallery">
                {productImages.length > 0 ? (
                  <div className="row">
                    <div className="col-12 mb-4">
                      <div className="product-main-image">
                        <Image
                          src={`/images/products/${productImages[0]}`}
                          alt={product.ProductName}
                          width={600}
                          height={600}
                          className="img-fluid"
                        />
                      </div>
                    </div>

                    {productImages.length > 1 && (
                      <div className="col-12">
                        <div className="product-thumbs row">
                          {productImages.map((img, index) => (
                            <div key={index} className="col-3">
                              <Image
                                src={`/images/products/${img}`}
                                alt={`${product.ProductName} - Image ${
                                  index + 1
                                }`}
                                width={150}
                                height={150}
                                className="img-fluid"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="product-no-image">
                    <Image
                      src="/images/products/placeholder.jpg"
                      alt={product.ProductName}
                      width={600}
                      height={600}
                      className="img-fluid"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="col-md-6">
              <div className="product-details">
                <h1 className="product-title">{product.ProductName}</h1>

                <div className="product-part-number mb-2">
                  Part #: {product.PartNumber}
                </div>

                <div className="product-price mb-3">
                  {product.Retail &&
                  product.Retail !== "0" &&
                  product.Retail !== product.Price ? (
                    <>
                      <span className="old-price">${product.Retail}</span>
                      <span className="new-price">${product.Price}</span>
                    </>
                  ) : (
                    <span className="current-price">${product.Price}</span>
                  )}
                </div>

                <div className="product-description mb-4">
                  <p>{product.Description}</p>
                </div>

                {/* Product Features */}
                {features.length > 0 && (
                  <div className="product-features mb-4">
                    <h3>Features</h3>
                    <ul className="list-group list-group-flush">
                      {features.map((feature, index) => (
                        <li
                          key={index}
                          className="list-group-item bg-transparent"
                        >
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Product Options */}
                <div className="product-options mb-4">
                  <div className="row">
                    {product.Color === "1" && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Color</label>
                        <select className="form-select">
                          <option value="">Select Color</option>
                          <option value="black">Black</option>
                          <option value="red">Red</option>
                        </select>
                      </div>
                    )}

                    {product.Hardware === "1" && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Hardware</label>
                        <select className="form-select">
                          <option value="">Standard Hardware</option>
                          <option value="stainless">
                            Stainless Steel (+$10)
                          </option>
                        </select>
                      </div>
                    )}

                    {product.Grease === "1" && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Grease</label>
                        <select className="form-select">
                          <option value="">No Grease</option>
                          <option value="standard">
                            Standard Grease (+$5)
                          </option>
                          <option value="synthetic">
                            Synthetic Grease (+$10)
                          </option>
                        </select>
                      </div>
                    )}

                    {product.AngleFinder === "1" && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Angle Finder</label>
                        <select className="form-select">
                          <option value="">No Angle Finder</option>
                          <option value="digital">
                            Digital Angle Finder (+$25)
                          </option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Add to Cart */}
                <div className="product-action">
                  <div className="row align-items-center">
                    <div className="col-sm-4">
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        defaultValue="1"
                      />
                    </div>
                    <div className="col-sm-8">
                      <button className="btn btn-primary btn-block">
                        <i className="icon-cart-plus"></i> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product Video */}
                {product.video && product.video !== "0" && (
                  <div className="product-video mt-4">
                    <h3>Product Video</h3>
                    <div className="ratio ratio-16x9">
                      <iframe
                        src={`https://www.youtube.com/embed/${product.video}`}
                        title={`${product.ProductName} Video`}
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="related-products mt-5">
            <h2>Related Products</h2>
            <div className="row">
              {relatedProducts.map((relatedProduct) => {
                // Create product URL slug for related products
                const relatedProductSlug =
                  relatedProduct.ProductName.toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "");

                return (
                  <div
                    key={relatedProduct.ProductID}
                    className="col-6 col-md-3 mb-4"
                  >
                    <div className="product-card">
                      <figure className="product-media">
                        <Link
                          href={`/products/${platform}/${mainCategory}/${category}/${relatedProductSlug}`}
                        >
                          <div className="product-image">
                            <Image
                              src={
                                relatedProduct.ImageSmall ||
                                "/images/products/placeholder.jpg"
                              }
                              alt={relatedProduct.ProductName}
                              width={300}
                              height={300}
                              className="img-fluid"
                            />
                          </div>
                        </Link>
                      </figure>

                      <div className="product-body">
                        <h3 className="product-title">
                          <Link
                            href={`/products/${platform}/${mainCategory}/${category}/${relatedProductSlug}`}
                          >
                            {relatedProduct.ProductName}
                          </Link>
                        </h3>
                        <div className="product-part-number">
                          Part #: {relatedProduct.PartNumber}
                        </div>
                        <div className="product-price">
                          ${relatedProduct.Price}
                        </div>
                      </div>

                      <div className="product-action">
                        <Link
                          href={`/products/${platform}/${mainCategory}/${category}/${relatedProductSlug}`}
                          className="btn btn-primary"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
