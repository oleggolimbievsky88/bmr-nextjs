import Footer1 from "@/components/footers/Footer";
import Header2 from "@/components/headers/Header";
import Login from "@/components/othersPages/Login";
import React from "react";

export const metadata = {
  title: "Login | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};
export default function page() {
  return (
    <>
      <Header2 />
      <div className="tf-page-title style-2">
        <div className="container-full">
          <div className="heading text-center">Log in</div>
        </div>
      </div>

      <Login />
      <Footer1 />
    </>
  );
}
