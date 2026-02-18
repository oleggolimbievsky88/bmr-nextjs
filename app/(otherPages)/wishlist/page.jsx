import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import Wishlist from "@/components/othersPages/Wishlist";
import React from "react";

export const metadata = {
  title:
    "Wishlist | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};
export default function page() {
  return (
    <div className="wishlist-page">
      <Header2 />
      <header className="wishlist-page-header">
        <div className="container">
          <h1 className="wishlist-page-title">Your Wishlist</h1>
          <p className="wishlist-page-subtitle">
            Save your favorite parts and come back anytime
          </p>
        </div>
      </header>

      <Wishlist />

      <Footer1 />
    </div>
  );
}
