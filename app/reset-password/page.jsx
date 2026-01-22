import Footer1 from "@/components/footer/Footer";
import Header18 from "@/components/header/Header18";
import PageHeader from "@/components/header/PageHeader";
import Topbar4 from "@/components/header/Topbar4";
import ResetPasswordClient from "@/components/othersPages/ResetPassword";
import React from "react";

export const metadata = {
	title:
		"Reset Password | BMR Suspension - Performance Racing Suspension & Chassis Parts",
	description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};

export default function ResetPasswordPage() {
	return (
		<>
			<Topbar4 />
			<Header18 showVehicleSearch={false} />
			<PageHeader title="RESET PASSWORD" />
			<ResetPasswordClient />
			<Footer1 />
		</>
	);
}
