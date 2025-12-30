import Footer1 from "@/components/footer/Footer"
import Header18 from "@/components/header/Header18"
import PageHeader from "@/components/header/PageHeader"
import Topbar4 from "@/components/header/Topbar4"
import VehicleSearch from "@/components/common/VehicleSearch"
import React from "react"

export const metadata = {
	title: "Dealer Portal | BMR Suspension | Performance Suspension & Chassis Parts",
	description:
		"BMR Suspension Dealer Portal - Coming soon. For dealer inquiries, please contact Kyle@bmrsuspension.com",
}

export default function DealersPortalPage() {
	return (
		<>
			<Topbar4 />
			<Header18 />
			<div className="vehicle-search-desktop-wrapper">
				<div className="container vehicle-search-desktop">
					<VehicleSearch />
				</div>
			</div>
			<PageHeader title="Dealer Portal" />
			<div className="container vehicle-search-mobile">
				<VehicleSearch />
			</div>
			<section className="flat-spacing-11">
				<div className="container">
					<div className="row">
						<div className="col-12">
							<div className="text-center" style={{ padding: "60px 20px" }}>
								<h2 className="mb-4">Dealer Portal Coming Soon</h2>
								<p className="lead mb-4">
									We're working hard to bring you an exclusive dealer portal with
									special pricing, order management, and more.
								</p>
								<p>
									For dealer inquiries, please email{" "}
									<a
										href="mailto:Kyle@bmrsuspension.com"
										style={{ color: "var(--primary-color, #007bff)" }}
									>
										Kyle@bmrsuspension.com
									</a>
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>
			<Footer1 />
		</>
	)
}
