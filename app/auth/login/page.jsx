"use client";

import Footer1 from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import PageHeader from "@/components/header/PageHeader";
import Topbar4 from "@/components/header/Topbar4";
import Login from "@/components/othersPages/Login";

export default function AuthLoginPage() {
  return (
    <>
      <Topbar4 />
      <Header showVehicleSearch={false} />
      <PageHeader title="LOGIN" />
      <Login />
      <Footer1 />
    </>
  );
}
