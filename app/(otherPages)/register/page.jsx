import Footer1 from "@/components/footers/Footer";
import Header2 from "@/components/headers/Header";
import Register from "@/components/othersPages/Register";
import React from "react";

export const metadata = {
  title: "Register | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};
export default function page() {
  return (
    <>
      <Header2 />
      <div className="tf-page-title style-2">
        <div className="container-full">
          <div className="heading text-center">Register</div>
        </div>
      </div>

      <Register />
      <Footer1 />
    </>
  );
}
