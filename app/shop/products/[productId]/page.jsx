"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProductDetailPage({ params }) {
  const [selectedColor, setSelectedColor] = useState("Red");
  const [addGrease, setAddGrease] = useState(false);
  const [addAngleFinder, setAddAngleFinder] = useState(false);

  // Mock product data (replace with actual API fetch)
  const product = {
    id: "MM590",
    name: "Motor Mount Kit, Polyurethane",
    platform: "1997-2004 C5 Corvettes",
    description:
      "Reduce engine deflection and improve throttle response on your C5 and C6 Corvettes with a Motor Mount Kit from BMR Suspension.",
    features: [
      "Heavy-duty laser cut steel plate",
      "90-durometer polyurethane bushings",
      "Reduces engine movement",
      "Improves throttle response",
      "Quickens reaction times",
      "Includes hardware and powder coat",
      "Allows for more accurate shifting in manual vehicles",
      "Maintains factory engine height",
    ],
    basePrice: 159.99,
    colors: ["Red", "Black Hammertone"],
    images: ["/path/to/product/image.jpg"],
    additionalOptions: [
      {
        name: "Grease",
        price: 19.99,
        description: "Additional lubricant for optimal performance",
      },
      {
        name: "Angle Finder",
        price: 29.99,
        description: "Precision alignment tool",
      },
    ],
  };

  const calculateTotalPrice = () => {
    let total = product.basePrice;
    if (addGrease) total += product.additionalOptions[0].price;
    if (addAngleFinder) total += product.additionalOptions[1].price;
    return total.toFixed(2);
  };

  return (
    <div className="container product-detail-page">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link href={`/products/${params.platform}`}>{params.platform}</Link>
          </li>
          <li className="breadcrumb-item">
            <Link href={`/products/${params.platform}/${params.category}`}>
              {params.category}
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="row">
        <div className="col-md-6">
          <Image
            src={product.images[0]}
            alt={product.name}
            width={500}
            height={500}
            className="img-fluid"
          />
        </div>
        <div className="col-md-6">
          <h1>{product.name}</h1>
          <p className="product-platform">{product.platform}</p>
          <p className="product-description">{product.description}</p>

          <div className="product-options">
            <h3>Color</h3>
            <div className="color-selection">
              {product.colors.map((color) => (
                <button
                  key={color}
                  className={`btn color-btn ${
                    selectedColor === color ? "selected" : ""
                  }`}
                  onClick={() => setSelectedColor(color)}
                >
                  {color}
                </button>
              ))}
            </div>

            <div className="additional-options">
              {product.additionalOptions.map((option) => (
                <div key={option.name} className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`add-${option.name.toLowerCase().replace(/\s+/g, "-")}`}
                    checked={
                      option.name === "Grease" ? addGrease : addAngleFinder
                    }
                    onChange={() =>
                      option.name === "Grease"
                        ? setAddGrease(!addGrease)
                        : setAddAngleFinder(!addAngleFinder)
                    }
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`add-${option.name
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    Add {option.name} (+${option.price})
                  </label>
                </div>
              ))}
            </div>

            <div className="product-price">
              <h2>${calculateTotalPrice()}</h2>
            </div>

            <button className="btn btn-primary add-to-cart-btn">
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <div className="product-details mt-5">
        <ul className="nav nav-tabs" id="productTabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className="nav-link active"
              id="description-tab"
              data-bs-toggle="tab"
              data-bs-target="#description"
              type="button"
              role="tab"
            >
              Description
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="applications-tab"
              data-bs-toggle="tab"
              data-bs-target="#applications"
              type="button"
              role="tab"
            >
              Applications
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="installation-tab"
              data-bs-toggle="tab"
              data-bs-target="#installation"
              type="button"
              role="tab"
            >
              Installation
            </button>
          </li>
        </ul>
        <div className="tab-content" id="productTabContent">
          <div
            className="tab-pane fade show active"
            id="description"
            role="tabpanel"
          >
            <ul>
              {product.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
          <div className="tab-pane fade" id="applications" role="tabpanel">
            <p>Fits 1997-2004 C5 Corvettes</p>
          </div>
          <div className="tab-pane fade" id="installation" role="tabpanel">
            <p>
              2-3 hour installation time. Professional installation recommended.
            </p>
          </div>
        </div>
      </div>

      <section className="related-products mt-5">
        <h3>YOU MAY ALSO LIKE...</h3>
        <div className="row">
          {/* Similar to the image's related products section */}
          {[
            {
              name: "Motor Mount Kit, Delrin",
              price: 129.99,
              image: "/path/to/related1.jpg",
            },
            {
              name: "Front/Rear Control Arm Delrin Bushing Kit",
              price: 79.99,
              image: "/path/to/related2.jpg",
            },
            {
              name: 'Brake Kit for 15" Conversion',
              price: 599.99,
              image: "/path/to/related3.jpg",
            },
          ].map((relatedProduct, index) => (
            <div key={index} className="col-4">
              <div className="related-product-item">
                <Image
                  src={relatedProduct.image}
                  alt={relatedProduct.name}
                  width={300}
                  height={300}
                  className="img-fluid"
                />
                <p>{relatedProduct.name}</p>
                <p>${relatedProduct.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// import Image from "next/image";
// import Link from "next/link";
// import { getProductData } from "@/lib/queries";

// // This enables dynamic rendering for this route
// export const dynamic = "force-dynamic";

// export default async function ProductDetailPage({ params }) {
//   const { platform, mainCategory, category, product: productSlug } = params;

//   // Get product data
//   const data = await getProductData(
//     productSlug,
//     platform,
//     mainCategory,
//     category
//   );

//   const { product, relatedProducts } = data;

//   // Parse product images
//   const productImages = product.Images
//     ? product.Images.split(",").filter((img) => img && img !== "0")
//     : [];

//   if (product.ImageLarge && product.ImageLarge !== "0") {
//     productImages.unshift(product.ImageLarge);
//   } else if (product.ImageSmall && product.ImageSmall !== "0") {
//     productImages.unshift(product.ImageSmall);
//   }

//   // Parse product features as list items
//   const features = product.Features
//     ? product.Features.split("\n").filter((item) => item.trim())
//     : [];

//   return (
//     <div className="shop-details">
//       <div className="container">
//         {/* Breadcrumb */}
//         <Breadcrumbs />

//         {/* Product Details */}
//         <div className="product-details-top">
//           <div className="row">
//             {/* Product Gallery */}
//             <div className="col-md-6">
//               <div className="product-gallery">
//                 {productImages.length > 0 ? (
//                   <div className="row">
//                     <div className="col-12 mb-4">
//                       <div className="product-main-image">
//                         <Image
//                           src={`/images/products/${productImages[0]}`}
//                           alt={product.ProductName}
//                           width={600}
//                           height={600}
//                           className="img-fluid"
//                         />
//                       </div>
//                     </div>

//                     {productImages.length > 1 && (
//                       <div className="col-12">
//                         <div className="product-thumbs row">
//                           {productImages.map((img, index) => (
//                             <div key={index} className="col-3">
//                               <Image
//                                 src={`/images/products/${img}`}
//                                 alt={`${product.ProductName} - Image ${
//                                   index + 1
//                                 }`}
//                                 width={150}
//                                 height={150}
//                                 className="img-fluid"
//                               />
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ) : (
//                   <div className="product-no-image">
//                     <Image
//                       src="/images/products/placeholder.jpg"
//                       alt={product.ProductName}
//                       width={600}
//                       height={600}
//                       className="img-fluid"
//                     />
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Product Info */}
//             <div className="col-md-6">
//               <div className="product-details">
//                 <h1 className="product-title">{product.ProductName}</h1>

//                 <div className="product-part-number mb-2">
//                   Part #: {product.PartNumber}
//                 </div>

//                 <div className="product-price mb-3">
//                   {product.Retail &&
//                   product.Retail !== "0" &&
//                   product.Retail !== product.Price ? (
//                     <>
//                       <span className="old-price">${product.Retail}</span>
//                       <span className="new-price">${product.Price}</span>
//                     </>
//                   ) : (
//                     <span className="current-price">${product.Price}</span>
//                   )}
//                 </div>

//                 <div className="product-description mb-4">
//                   <p>{product.Description}</p>
//                 </div>

//                 {/* Product Features */}
//                 {features.length > 0 && (
//                   <div className="product-features mb-4">
//                     <h3>Features</h3>
//                     <ul className="list-group list-group-flush">
//                       {features.map((feature, index) => (
//                         <li
//                           key={index}
//                           className="list-group-item bg-transparent"
//                         >
//                           {feature}
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}

//                 {/* Product Options */}
//                 <div className="product-options mb-4">
//                   <div className="row">
//                     {product.Color === "1" && (
//                       <div className="col-md-6 mb-3">
//                         <label className="form-label">Color</label>
//                         <select className="form-select">
//                           <option value="">Select Color</option>
//                           <option value="black">Black</option>
//                           <option value="red">Red</option>
//                         </select>
//                       </div>
//                     )}

//                     {product.Hardware === "1" && (
//                       <div className="col-md-6 mb-3">
//                         <label className="form-label">Hardware</label>
//                         <select className="form-select">
//                           <option value="">Standard Hardware</option>
//                           <option value="stainless">
//                             Stainless Steel (+$10)
//                           </option>
//                         </select>
//                       </div>
//                     )}

//                     {product.Grease === "1" && (
//                       <div className="col-md-6 mb-3">
//                         <label className="form-label">Grease</label>
//                         <select className="form-select">
//                           <option value="">No Grease</option>
//                           <option value="standard">
//                             Standard Grease (+$5)
//                           </option>
//                           <option value="synthetic">
//                             Synthetic Grease (+$10)
//                           </option>
//                         </select>
//                       </div>
//                     )}

//                     {product.AngleFinder === "1" && (
//                       <div className="col-md-6 mb-3">
//                         <label className="form-label">Angle Finder</label>
//                         <select className="form-select">
//                           <option value="">No Angle Finder</option>
//                           <option value="digital">
//                             Digital Angle Finder (+$25)
//                           </option>
//                         </select>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Add to Cart */}
//                 <div className="product-action">
//                   <div className="row align-items-center">
//                     <div className="col-sm-4">
//                       <input
//                         type="number"
//                         className="form-control"
//                         min="1"
//                         defaultValue="1"
//                       />
//                     </div>
//                     <div className="col-sm-8">
//                       <button className="btn btn-primary btn-block">
//                         <i className="icon-cart-plus"></i> Add to Cart
//                       </button>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Product Video */}
//                 {product.video && product.video !== "0" && (
//                   <div className="product-video mt-4">
//                     <h3>Product Video</h3>
//                     <div className="ratio ratio-16x9">
//                       <iframe
//                         src={`https://www.youtube.com/embed/${product.video}`}
//                         title={`${product.ProductName} Video`}
//                         allowFullScreen
//                       ></iframe>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Related Products */}
//         {relatedProducts.length > 0 && (
//           <div className="related-products mt-5">
//             <h2>Related Products</h2>
//             <div className="row">
//               {relatedProducts.map((relatedProduct) => {
//                 // Create product URL slug for related products
//                 const relatedProductSlug =
//                   relatedProduct.ProductName.toLowerCase()
//                     .replace(/[^a-z0-9]+/g, "-")
//                     .replace(/(^-|-$)/g, "");

//                 return (
//                   <div
//                     key={relatedProduct.ProductID}
//                     className="col-6 col-md-3 mb-4"
//                   >
//                     <div className="product-card">
//                       <figure className="product-media">
//                         <Link
//                           href={`/products/${platform}/${mainCategory}/${category}/${relatedProductSlug}`}
//                         >
//                           <div className="product-image">
//                             <Image
//                               src={
//                                 relatedProduct.ImageSmall ||
//                                 "/images/products/placeholder.jpg"
//                               }
//                               alt={relatedProduct.ProductName}
//                               width={300}
//                               height={300}
//                               className="img-fluid"
//                             />
//                           </div>
//                         </Link>
//                       </figure>

//                       <div className="product-body">
//                         <h3 className="product-title">
//                           <Link
//                             href={`/products/${platform}/${mainCategory}/${category}/${relatedProductSlug}`}
//                           >
//                             {relatedProduct.ProductName}
//                           </Link>
//                         </h3>
//                         <div className="product-part-number">
//                           Part #: {relatedProduct.PartNumber}
//                         </div>
//                         <div className="product-price">
//                           ${relatedProduct.Price}
//                         </div>
//                       </div>

//                       <div className="product-action">
//                         <Link
//                           href={`/products/${platform}/${mainCategory}/${category}/${relatedProductSlug}`}
//                           className="btn btn-primary"
//                         >
//                           View Details
//                         </Link>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
