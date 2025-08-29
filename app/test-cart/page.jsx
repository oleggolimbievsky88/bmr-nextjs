"use client";
import { useContextElement } from "@/context/Context";
import { useState } from "react";

export default function TestCart() {
  const { cartProducts, addProductToCart, clearCart } = useContextElement();
  const [testProductId, setTestProductId] = useState("2781");

  const handleAddTestProduct = () => {
    addProductToCart(testProductId, 1, {
      selectedColor: "Black Hammertone",
      selectedGrease: "No Thanks",
      selectedAnglefinder: null,
      selectedHardware: null,
    });
  };

  return (
    <div className="container mt-5">
      <h1>Cart Test Page</h1>

      <div className="row">
        <div className="col-md-6">
          <h3>Add Test Product</h3>
          <div className="mb-3">
            <label className="form-label">Product ID:</label>
            <input
              type="text"
              className="form-control"
              value={testProductId}
              onChange={(e) => setTestProductId(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary me-2"
            onClick={handleAddTestProduct}
          >
            Add to Cart
          </button>
          <button className="btn btn-danger" onClick={clearCart}>
            Clear Cart
          </button>
        </div>

        <div className="col-md-6">
          <h3>Current Cart</h3>
          <pre className="bg-light p-3">
            {JSON.stringify(cartProducts, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
