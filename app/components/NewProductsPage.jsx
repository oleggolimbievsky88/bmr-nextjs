async function getProducts(scratchDent = "0") {
  try {
    // Use relative URL to work in both development and production
    const res = await fetch(
      `/api/products/new-products?scrachDent=${scratchDent}`,
      {
        cache: "no-store",
      }
    );
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    // Return demo products as fallback if database fails
    return [
      {
        ProductID: 1,
        ProductName: "BMR Suspension SP041",
        Price: "219.95",
        ImageSmall: "product1.jpg",
        PlatformName: "S550 Mustang",
        BrandName: "BMR",
      },
      {
        ProductID: 2,
        ProductName: "BMR Suspension SP042",
        Price: "189.95",
        ImageSmall: "product2.jpg",
        PlatformName: "S197 Mustang",
        BrandName: "BMR",
      },
    ];
  }
}

export default async function NewProductsPage({ scratchDent = "0" }) {
  const products = await getProducts(scratchDent);

  return (
    <div className="container">
      <div className="row">
        <div className="col-lg-12">
          <div className="title-section text-center">
            <h2 className="flat-title">
              {scratchDent === "1" ? "Scratch & Dent Products" : "New Products"}
            </h2>
            <p className="sub-title">
              {scratchDent === "1"
                ? "Great deals on slightly imperfect items"
                : "Check out our latest additions"}
            </p>
          </div>
        </div>
      </div>

      <div className="row">
        {products.map((product) => (
          <div key={product.ProductID} className="col-md-3 mb-4">
            <div className="card h-100">
              <img
                src={`/images/products/${product.ImageSmall || "default.jpg"}`}
                className="card-img-top"
                alt={product.ProductName}
              />
              <div className="card-body">
                <h5 className="card-title">{product.ProductName}</h5>
                <p className="card-text">
                  {product.PlatformName && (
                    <span className="badge bg-secondary me-2">
                      {product.PlatformName}
                    </span>
                  )}
                  {product.BrandName && (
                    <span className="badge bg-primary me-2">
                      {product.BrandName}
                    </span>
                  )}
                  <span className="price">${product.Price}</span>
                </p>
                {product.Categories && (
                  <p className="categories">
                    {product.Categories.split(",").map((cat, i) => (
                      <span key={i} className="badge bg-light text-dark me-1">
                        {cat}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
