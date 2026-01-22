import Footer1 from "@/components/footer/Footer";
import Header18 from "@/components/header/Header18";
import PageHeader from "@/components/header/PageHeader";
import Topbar4 from "@/components/header/Topbar4";
import VerifyEmailClient from "@/components/othersPages/VerifyEmail";
import React from "react";

export const metadata = {
	title:
		"Verify Email | BMR Suspension - Performance Racing Suspension & Chassis Parts",
	description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};

export default function VerifyEmailPage() {
	return (
		<>
			<Topbar4 />
			<Header18 showVehicleSearch={false} />
			<PageHeader title="VERIFY EMAIL" />
			<VerifyEmailClient />
			<Footer1 />
		</>
	);
}
